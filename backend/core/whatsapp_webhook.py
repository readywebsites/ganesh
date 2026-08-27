import os
import json
import hmac
import hashlib
import logging
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View

logger = logging.getLogger(__name__)


def get_verify_token() -> str:
    """
    Returns the configured WhatsApp Webhook Verification Token.
    Can be set via environment variable `WHATSAPP_VERIFY_TOKEN`.
    """
    return os.environ.get('WHATSAPP_VERIFY_TOKEN', 'ganpati_biz499_webhook_token_2026_x9k2p8v').strip()


@method_decorator(csrf_exempt, name='dispatch')
class WhatsAppWebhookView(View):
    """
    WhatsApp Cloud API Webhook Endpoint (/api/whatsapp/webhook).

    - GET: Handles Meta Webhook Verification handshake:
      - Reads `hub.mode`, `hub.verify_token`, and `hub.challenge`
      - Compares verify token with WHATSAPP_VERIFY_TOKEN
      - If valid, responds with `hub.challenge` (HTTP 200)
      - If invalid, responds with HTTP 403 Forbidden

    - POST: Receives real-time WhatsApp Cloud API events:
      - Validates optional X-Hub-Signature-256 HMAC (if WHATSAPP_APP_SECRET configured)
      - Parses & logs incoming message payloads and status receipts
      - Returns HTTP 200 quickly (within 3 seconds as required by Meta)
    """

    def get(self, request, *args, **kwargs):
        """
        Handles Meta webhook verification GET request.
        """
        mode = request.GET.get('hub.mode')
        token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')

        configured_token = get_verify_token()

        if mode and token:
            if mode == 'subscribe' and token == configured_token:
                logger.info("[WhatsApp Webhook] Meta verification successful. Challenge returned.")
                # Meta requires the challenge string returned as plain text with 200 OK
                return HttpResponse(challenge, content_type="text/plain", status=200)
            else:
                logger.warning(
                    "[WhatsApp Webhook] Verification token mismatch. "
                    "Received token does not match configured WHATSAPP_VERIFY_TOKEN."
                )
                return HttpResponse("Verification token mismatch", status=403)

        logger.warning("[WhatsApp Webhook] Missing hub.mode or hub.verify_token parameters in GET request.")
        return HttpResponse("Invalid request parameters", status=400)

    def post(self, request, *args, **kwargs):
        """
        Handles incoming WhatsApp Cloud API webhook events.
        """
        raw_body = request.body
        app_secret = os.environ.get('WHATSAPP_APP_SECRET', '').strip()

        # Optional Meta HMAC SHA256 Signature Verification
        if app_secret:
            signature_header = request.headers.get('X-Hub-Signature-256', '')
            if not self._verify_signature(raw_body, signature_header, app_secret):
                logger.warning("[WhatsApp Webhook] X-Hub-Signature-256 signature verification failed.")
                return HttpResponse("Invalid signature", status=403)

        if not raw_body:
            return HttpResponse("EVENT_RECEIVED", content_type="text/plain", status=200)

        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError) as err:
            logger.error(f"[WhatsApp Webhook] Failed to decode incoming JSON payload: {err}")
            return HttpResponse("Invalid JSON", status=400)

        # Parse and log the webhook event safely
        self._process_webhook_payload(payload)

        # Meta requires an immediate HTTP 200 response to acknowledge receipt
        return HttpResponse("EVENT_RECEIVED", content_type="text/plain", status=200)

    def _verify_signature(self, raw_body: bytes, signature_header: str, app_secret: str) -> bool:
        """
        Verifies Meta's X-Hub-Signature-256 header using HMAC-SHA256.
        """
        if not signature_header or not signature_header.startswith("sha256="):
            return False
        try:
            received_sig = signature_header.split("sha256=")[1].strip()
            expected_sig = hmac.new(app_secret.encode('utf-8'), raw_body, hashlib.sha256).hexdigest()
            return hmac.compare_digest(expected_sig, received_sig)
        except Exception as e:
            logger.error(f"[WhatsApp Webhook] Signature verification error: {e}")
            return False

    def _process_webhook_payload(self, payload: dict) -> None:
        """
        Safely processes and logs incoming WhatsApp Cloud API events.
        """
        try:
            obj = payload.get('object', '')
            if obj != 'whatsapp_business_account':
                logger.info(f"[WhatsApp Webhook] Received non-WABA event object: {obj}")
                return

            entry_list = payload.get('entry', [])
            for entry in entry_list:
                changes = entry.get('changes', [])
                for change in changes:
                    field = change.get('field', '')
                    if field != 'messages':
                        continue

                    val = change.get('value', {})
                    metadata = val.get('metadata', {})
                    phone_number_id = metadata.get('phone_number_id', 'N/A')

                    # 1. Incoming Devotee Messages
                    messages = val.get('messages', [])
                    for msg in messages:
                        from_phone = msg.get('from', '')
                        msg_type = msg.get('type', '')
                        msg_id = msg.get('id', '')

                        body_preview = ""
                        if msg_type == 'text':
                            body_preview = msg.get('text', {}).get('body', '')
                        elif msg_type == 'interactive':
                            body_preview = f"[Interactive: {msg.get('interactive', {}).get('type', '')}]"
                        else:
                            body_preview = f"[{msg_type}]"

                        logger.info(
                            f"[WhatsApp Webhook] Incoming message from {from_phone} "
                            f"(PhoneID: {phone_number_id}, MsgID: {msg_id}): {body_preview}"
                        )

                    # 2. Message Delivery Status Receipts (sent, delivered, read, failed)
                    statuses = val.get('statuses', [])
                    for st in statuses:
                        status_id = st.get('id', '')
                        status_name = st.get('status', '')
                        recipient_id = st.get('recipient_id', '')
                        errors = st.get('errors', [])
                        if errors:
                            logger.warning(
                                f"[WhatsApp Webhook] Delivery FAILURE for {recipient_id} "
                                f"(MsgID: {status_id}): {errors}"
                            )
                        else:
                            logger.info(
                                f"[WhatsApp Webhook] Status: '{status_name}' for {recipient_id} "
                                f"(MsgID: {status_id})"
                            )
        except Exception as e:
            logger.error(f"[WhatsApp Webhook] Error processing event data: {e}", exc_info=True)
