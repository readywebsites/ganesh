import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)


def send_whatsapp_message(to_phone: str, message_text: str) -> bool:
    """
    Sends a WhatsApp message using WhatsApp Business / Cloud API.
    Configurable via environment variables:
      - WHATSAPP_ENABLED: 'true' / 'false' (default: True)
      - WHATSAPP_PHONE_NUMBER / WHATSAPP_ADMIN_PHONE: default '9662279799'
      - WHATSAPP_ACCESS_TOKEN: Cloud API bearer token
      - WHATSAPP_PHONE_NUMBER_ID: Cloud API Phone Number ID

    Gracefully fails without crashing or raising exceptions so database bookings are never affected.
    """
    enabled_str = os.environ.get('WHATSAPP_ENABLED', 'true').strip().lower()
    enabled = enabled_str in ('true', '1', 'yes')
    if not enabled:
        logger.info(f"[WhatsApp] Notification skipped (WHATSAPP_ENABLED is False). Recipient: {to_phone}")
        return False

    access_token = os.environ.get('WHATSAPP_ACCESS_TOKEN', '').strip()
    phone_number_id = os.environ.get('WHATSAPP_PHONE_NUMBER_ID', '').strip()

    if not access_token or not phone_number_id:
        logger.info(
            f"[WhatsApp] Credentials not configured (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing). "
            f"Simulated notification to {to_phone}:\n{message_text}"
        )
        return False

    # Normalize phone digits: add 91 if 10-digit Indian number
    clean_phone = "".join(filter(str.isdigit, str(to_phone)))
    if len(clean_phone) == 10:
        clean_phone = f"91{clean_phone}"

    url = f"https://graph.facebook.com/v20.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_phone,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message_text
        }
    }

    try:
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            logger.info(f"[WhatsApp] Message successfully delivered to {clean_phone}: {res_body}")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore') if hasattr(e, 'read') else str(e)
        logger.error(f"[WhatsApp] API HTTP Error {e.code} for recipient {clean_phone}: {err_body}")
        return False
    except Exception as e:
        logger.error(f"[WhatsApp] Exception while sending notification to {clean_phone}: {e}", exc_info=True)
        return False


def notify_admin_and_customer_on_booking(booking) -> None:
    """
    Sends WhatsApp notifications on successful Aarti Booking creation:
    1. Admin notification to 9662279799 (or configured WHATSAPP_PHONE_NUMBER)
    2. Customer booking confirmation to devotee's mobile number
    """
    try:
        aarti_display = "Morning Aarti" if booking.aarti_type == "morning" else "Night Aarti"
        if hasattr(booking, 'get_aarti_type_display'):
            aarti_display = booking.get_aarti_type_display()

        admin_phone = os.environ.get('WHATSAPP_PHONE_NUMBER', '9662279799').strip() or '9662279799'
        booking_id = getattr(booking, 'booking_id', str(booking.id))
        city = getattr(booking, 'city', '') or 'Surat'
        special_note = booking.notes or 'None'
        status_text = booking.status.title() if booking.status else 'Confirmed'

        # 1. Admin Notification
        admin_message = (
            f"New Aarti Booking\n\n"
            f"Name: {booking.devotee_name}\n"
            f"Mobile: {booking.phone}\n"
            f"Email: {booking.email}\n"
            f"City: {city}\n"
            f"Date: {booking.booking_date}\n"
            f"Aarti: {aarti_display}\n"
            f"Persons: {booking.number_of_devotees}\n"
            f"Special Note: {special_note}\n"
            f"Booking ID: {booking_id}\n"
            f"Status: {status_text}"
        )
        send_whatsapp_message(admin_phone, admin_message)

        # 2. Customer Notification
        if booking.phone:
            customer_message = (
                f"Aarti Booking Confirmed\n\n"
                f"Booking ID: {booking_id}\n"
                f"Devotee: {booking.devotee_name}\n"
                f"Date: {booking.booking_date}\n"
                f"Aarti: {aarti_display}\n"
                f"Persons: {booking.number_of_devotees}\n"
                f"City: {city}\n\n"
                f"Please arrive 20 minutes prior to the Aarti.\n"
                f"Ganpati Bappa Morya! 🙏"
            )
            send_whatsapp_message(booking.phone, customer_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Notification handler failure: {e}", exc_info=True)
