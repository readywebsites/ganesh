import os
import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from django.utils import timezone

logger = logging.getLogger(__name__)


def get_admin_phone() -> str:
    """
    Returns the target admin WhatsApp phone number normalized with country code.
    Defaults to '919662279799' (+91 9662279799).
    """
    raw_phone = (
        os.environ.get('WHATSAPP_ADMIN_PHONE')
        or os.environ.get('WHATSAPP_PHONE_NUMBER')
        or os.environ.get('ADMIN_PHONE')
        or os.environ.get('ADMIN_WHATSAPP_NUMBER')
        or '9662279799'
    ).strip()

    # Clean non-digit characters
    clean_digits = "".join(filter(str.isdigit, str(raw_phone)))
    if len(clean_digits) == 10:
        return f"91{clean_digits}"
    return clean_digits or "919662279799"


def get_whatsapp_config_status() -> dict:
    """
    Returns the current WhatsApp integration status and configured provider.
    Masks credentials for safety.
    """
    enabled_str = os.environ.get('WHATSAPP_ENABLED', 'true').strip().lower()
    enabled = enabled_str in ('true', '1', 'yes')

    access_token = (
        os.environ.get('WHATSAPP_ACCESS_TOKEN')
        or os.environ.get('WHATSAPP_TOKEN')
        or os.environ.get('META_WHATSAPP_TOKEN')
        or ''
    ).strip()

    phone_number_id = os.environ.get('WHATSAPP_PHONE_NUMBER_ID', '').strip()
    custom_api_url = (
        os.environ.get('WHATSAPP_API_URL')
        or os.environ.get('WHATSAPP_GATEWAY_URL')
        or os.environ.get('WHATSAPP_ENDPOINT')
        or ''
    ).strip()

    admin_phone = get_admin_phone()

    if custom_api_url:
        provider = "Custom Gateway / Webhook API"
        configured = True
    elif access_token and phone_number_id:
        provider = "Meta WhatsApp Cloud API (Graph API)"
        configured = True
    else:
        provider = "Simulation / Console Logger (Credentials pending in .env)"
        configured = False

    return {
        "enabled": enabled,
        "configured": configured,
        "provider": provider,
        "admin_phone": f"+{admin_phone}",
        "phone_number_id": phone_number_id if phone_number_id else None,
        "custom_api_url": custom_api_url if custom_api_url else None,
        "access_token_configured": bool(access_token),
    }


def send_whatsapp_admin_alert(message_text: str) -> bool:
    """
    Helper to send a direct WhatsApp alert message ONLY to the configured admin.
    """
    admin_phone = get_admin_phone()
    return send_whatsapp_message(admin_phone, message_text)


def send_whatsapp_message(to_phone: str, message_text: str) -> bool:
    """
    Universal WhatsApp notification dispatcher supporting multiple API configurations:
    
    1. Official Meta WhatsApp Cloud API (Graph API):
       - WHATSAPP_ACCESS_TOKEN / WHATSAPP_TOKEN
       - WHATSAPP_PHONE_NUMBER_ID
       - (Optional: WHATSAPP_API_VERSION, default 'v20.0')
    
    2. Custom / Third-Party WhatsApp API Gateway (e.g. UltraMsg, Wablas, Wati, GreenAPI, TextMeBot, Wassenger, Twilio, Fast2SMS, Maytapi, or any HTTP endpoint):
       - WHATSAPP_API_URL / WHATSAPP_GATEWAY_URL / WHATSAPP_ENDPOINT
       - WHATSAPP_API_KEY / WHATSAPP_TOKEN / WHATSAPP_INSTANCE_ID
    
    3. Graceful Simulation / Logging Mode:
       - If no credentials configured, logs simulated alert to console/logger without crashing.
    """
    enabled_str = os.environ.get('WHATSAPP_ENABLED', 'true').strip().lower()
    enabled = enabled_str in ('true', '1', 'yes')
    if not enabled:
        logger.info(f"[WhatsApp] Notification skipped (WHATSAPP_ENABLED is False). Recipient: {to_phone}")
        return False

    # Normalize target phone number (ensure country code for 10-digit Indian numbers)
    clean_phone = "".join(filter(str.isdigit, str(to_phone)))
    if len(clean_phone) == 10:
        clean_phone = f"91{clean_phone}"

    # Extract all possible env configurations
    access_token = (
        os.environ.get('WHATSAPP_ACCESS_TOKEN')
        or os.environ.get('WHATSAPP_TOKEN')
        or os.environ.get('META_WHATSAPP_TOKEN')
        or ''
    ).strip()

    phone_number_id = os.environ.get('WHATSAPP_PHONE_NUMBER_ID', '').strip()
    api_version = os.environ.get('WHATSAPP_API_VERSION', 'v20.0').strip()

    custom_api_url = (
        os.environ.get('WHATSAPP_API_URL')
        or os.environ.get('WHATSAPP_GATEWAY_URL')
        or os.environ.get('WHATSAPP_ENDPOINT')
        or ''
    ).strip()

    api_key = (
        os.environ.get('WHATSAPP_API_KEY')
        or access_token
        or ''
    ).strip()

    instance_id = os.environ.get('WHATSAPP_INSTANCE_ID', '').strip()

    # Mode 1: Custom / Third-party WhatsApp Gateway URL provided
    if custom_api_url:
        return _send_via_custom_gateway(custom_api_url, clean_phone, message_text, api_key, instance_id)

    # Mode 2: Meta WhatsApp Cloud API (Graph API)
    if access_token and phone_number_id:
        return _send_via_meta_cloud_api(phone_number_id, access_token, api_version, clean_phone, message_text)

    # Mode 3: Simulation / Unconfigured State
    logger.info(
        f"\n==================== [WHATSAPP ADMIN ALERT SIMULATION] ====================\n"
        f"Admin Phone: +{clean_phone}\n"
        f"Message:\n{message_text}\n"
        f"---------------------------------------------------------------------------\n"
        f"Note: To send real WhatsApp messages, add your WhatsApp API details in .env\n"
        f"===========================================================================\n"
    )
    return False


def _send_via_meta_cloud_api(phone_number_id: str, access_token: str, api_version: str, clean_phone: str, message_text: str) -> bool:
    """Sends message via Meta WhatsApp Cloud Graph API."""
    url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "User-Agent": "GaneshMahotsav-WhatsApp/2.0",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_phone,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message_text,
        },
    }

    try:
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=12) as response:
            res_body = response.read().decode('utf-8')
            logger.info(f"[WhatsApp] Meta Cloud API alert delivered to admin ({clean_phone}): {res_body}")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore') if hasattr(e, 'read') else str(e)
        logger.error(f"[WhatsApp] Meta Cloud API HTTP Error {e.code} for recipient {clean_phone}: {err_body}")
        return False
    except Exception as e:
        logger.error(f"[WhatsApp] Exception sending Meta Cloud API alert to {clean_phone}: {e}", exc_info=True)
        return False


def _send_via_custom_gateway(custom_api_url: str, clean_phone: str, message_text: str, api_key: str, instance_id: str) -> bool:
    """Sends message via generic WhatsApp API endpoint / gateway."""
    try:
        # Check if URL contains query placeholders like {phone} and {message}
        if '{phone}' in custom_api_url or '{message}' in custom_api_url or '{msg}' in custom_api_url or '{text}' in custom_api_url:
            encoded_msg = urllib.parse.quote(message_text)
            final_url = custom_api_url.replace('{phone}', clean_phone)\
                                      .replace('{number}', clean_phone)\
                                      .replace('{to}', clean_phone)\
                                      .replace('{message}', encoded_msg)\
                                      .replace('{msg}', encoded_msg)\
                                      .replace('{text}', encoded_msg)\
                                      .replace('{api_key}', urllib.parse.quote(api_key))\
                                      .replace('{token}', urllib.parse.quote(api_key))\
                                      .replace('{instance}', urllib.parse.quote(instance_id))
            req = urllib.request.Request(final_url, method='GET')
            if api_key:
                req.add_header("Authorization", f"Bearer {api_key}")
                req.add_header("x-api-key", api_key)
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = response.read().decode('utf-8')
                logger.info(f"[WhatsApp] Custom Gateway GET alert delivered to admin ({clean_phone}): {res_body}")
                return True

        # Otherwise perform standard POST JSON
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "GaneshMahotsav-WhatsApp/2.0",
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
            headers["x-api-key"] = api_key

        payload = {
            "to": clean_phone,
            "phone": clean_phone,
            "number": clean_phone,
            "receiver": clean_phone,
            "message": message_text,
            "msg": message_text,
            "body": message_text,
            "text": message_text,
        }
        if api_key:
            payload["token"] = api_key
            payload["api_key"] = api_key
        if instance_id:
            payload["instance_id"] = instance_id
            payload["instance"] = instance_id

        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(custom_api_url, data=data_bytes, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=12) as response:
            res_body = response.read().decode('utf-8')
            logger.info(f"[WhatsApp] Custom Gateway POST alert delivered to admin ({clean_phone}): {res_body}")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore') if hasattr(e, 'read') else str(e)
        logger.error(f"[WhatsApp] Custom Gateway HTTP Error {e.code} for recipient {clean_phone}: {err_body}")
        return False
    except Exception as e:
        logger.error(f"[WhatsApp] Exception sending Custom Gateway alert to {clean_phone}: {e}", exc_info=True)
        return False


def format_aarti_date(booking_date) -> str:
    """Formats date object or string into human-readable format like '20 September 2026'."""
    if not booking_date:
        return '20 September 2026'
    try:
        if hasattr(booking_date, 'strftime'):
            return booking_date.strftime('%d %B %Y')
        from datetime import datetime
        dt = datetime.strptime(str(booking_date).strip(), '%Y-%m-%d')
        return dt.strftime('%d %B %Y')
    except Exception:
        return str(booking_date)


def notify_admin_on_booking(booking) -> None:
    """
    Sends WhatsApp direct alert ONLY to Admin whenever someone fills the Aarti Booking form.
    User will not receive any notification or alert.
    """
    try:
        name = getattr(booking, 'devotee_name', '')
        phone = getattr(booking, 'phone', '')
        email = getattr(booking, 'email', '') or 'N/A'
        city = getattr(booking, 'city', '') or 'Surat'
        booking_date = getattr(booking, 'booking_date', '')
        formatted_date = format_aarti_date(booking_date)
        number_of_devotees = getattr(booking, 'number_of_devotees', 1)
        notes = getattr(booking, 'notes', '') or 'None'
        booking_id = getattr(booking, 'booking_id', str(booking.id))

        raw_aarti = getattr(booking, 'aarti_type', 'morning')
        if 'morning' in str(raw_aarti).lower() or 'mangala' in str(raw_aarti).lower() or 'rajbhog' in str(raw_aarti).lower():
            aarti_title = "Morning Aarti"
            aarti_time = "09:00 AM"
        else:
            aarti_title = "Night Aarti"
            aarti_time = "08:00 PM"

        created_at = getattr(booking, 'created_at', None)
        submitted_time = (
            created_at.strftime('%d %B %Y, %I:%M %p')
            if (created_at and hasattr(created_at, 'strftime'))
            else timezone.now().strftime('%d %B %Y, %I:%M %p')
        )

        admin_message = (
            f"🙏 *NEW AARTI BOOKING ALERT*\n\n"
            f"📋 *Booking ID:* {booking_id}\n"
            f"👤 *Devotee Name:* {name}\n"
            f"📱 *Mobile:* {phone}\n"
            f"📧 *Email:* {email}\n"
            f"🏙️ *City:* {city}\n\n"
            f"📅 *Aarti Date:* {formatted_date}\n"
            f"🕉️ *Aarti Slot:* {aarti_title}\n"
            f"⏰ *Time:* {aarti_time}\n"
            f"👥 *Devotees Count:* {number_of_devotees}\n"
            f"📝 *Special Note:* {notes}\n\n"
            f"⏱️ *Submitted At:* {submitted_time}"
        )
        send_whatsapp_admin_alert(admin_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Aarti Booking admin alert failure: {e}", exc_info=True)


def notify_admin_on_donation(donation) -> None:
    """
    Sends WhatsApp direct alert ONLY to Admin whenever someone fills the Donation form.
    User will not receive any notification or alert.
    """
    try:
        name = getattr(donation, 'donor_name', '')
        phone = getattr(donation, 'phone', '')
        email = getattr(donation, 'email', '')
        email_str = email if (email and email != 'devotee@suratchagaurinandan.com') else 'N/A'
        raw_amount = getattr(donation, 'amount', '')
        try:
            amt_val = float(raw_amount)
            formatted_amount = f"{int(amt_val):,}" if amt_val.is_integer() else f"{amt_val:,.2f}"
        except (ValueError, TypeError):
            formatted_amount = str(raw_amount)

        payment_method = getattr(donation, 'payment_method', 'GPay / UPI') or 'GPay / UPI'
        if payment_method == 'upi':
            payment_method = 'GPay / UPI'

        transaction_id = getattr(donation, 'transaction_id', 'Pending Verification')

        created_at = getattr(donation, 'created_at', None)
        submitted_time = (
            created_at.strftime('%d %B %Y, %I:%M %p')
            if (created_at and hasattr(created_at, 'strftime'))
            else timezone.now().strftime('%d %B %Y, %I:%M %p')
        )

        admin_message = (
            f"💰 *NEW DONATION ALERT*\n\n"
            f"👤 *Donor Name:* {name}\n"
            f"📱 *Mobile:* {phone}\n"
            f"📧 *Email:* {email_str}\n"
            f"💵 *Amount:* ₹{formatted_amount}\n"
            f"💳 *Payment Method:* {payment_method}\n"
            f"🆔 *Transaction ID:* {transaction_id}\n"
            f"⏳ *Status:* Pending Verification\n\n"
            f"⏱️ *Submitted At:* {submitted_time}\n\n"
            f"ℹ️ *Action:* Please verify the payment in the bank / GPay account."
        )
        send_whatsapp_admin_alert(admin_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Donation admin alert failure: {e}", exc_info=True)


def notify_admin_on_contact(contact) -> None:
    """
    Sends WhatsApp direct alert ONLY to Admin whenever someone fills the 'Send Message to Trust' form.
    User will not receive any notification or alert.
    """
    try:
        name = getattr(contact, 'name', '')
        phone = getattr(contact, 'phone', '') or 'N/A'
        email = getattr(contact, 'email', '')
        subject = getattr(contact, 'subject', '') or 'General Pilgrim Inquiry'
        message = getattr(contact, 'message', '')

        created_at = getattr(contact, 'created_at', None)
        submitted_time = (
            created_at.strftime('%d %B %Y, %I:%M %p')
            if (created_at and hasattr(created_at, 'strftime'))
            else timezone.now().strftime('%d %B %Y, %I:%M %p')
        )

        admin_message = (
            f"📩 *NEW MESSAGE TO TRUST ALERT*\n\n"
            f"👤 *Devotee Name:* {name}\n"
            f"📱 *Mobile:* {phone}\n"
            f"📧 *Email:* {email}\n"
            f"📌 *Subject:* {subject}\n\n"
            f"💬 *Message:*\n{message}\n\n"
            f"⏱️ *Submitted At:* {submitted_time}"
        )
        send_whatsapp_admin_alert(admin_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Contact inquiry admin alert failure: {e}", exc_info=True)


def notify_admin_on_membership(membership) -> None:
    """
    Sends WhatsApp direct alert ONLY to Admin on Bhakta Membership registration.
    User will not receive any notification or alert.
    """
    try:
        full_name = getattr(membership, 'full_name', '')
        phone = getattr(membership, 'phone', '')
        email = getattr(membership, 'email', '')
        city = getattr(membership, 'city', '') or 'Surat'
        address = getattr(membership, 'address', '')
        occupation = getattr(membership, 'occupation', '') or 'Not Specified'
        volunteer = getattr(membership, 'volunteer', '') or 'Aarti & Ritual Assistance'
        membership_id = getattr(membership, 'membership_id', str(membership.id))

        if hasattr(membership, 'get_membership_tier_display'):
            membership_type = membership.get_membership_tier_display()
        else:
            membership_type = getattr(membership, 'membership_tier', 'Silver Bhakta')

        city_address = f"{city}, {address}" if address and address != city else city

        created_at = getattr(membership, 'created_at', None)
        submitted_time = (
            created_at.strftime('%d %B %Y, %I:%M %p')
            if (created_at and hasattr(created_at, 'strftime'))
            else timezone.now().strftime('%d %B %Y, %I:%M %p')
        )

        admin_message = (
            f"🙏 *NEW MEMBERSHIP REGISTRATION ALERT*\n\n"
            f"📋 *Membership ID:* {membership_id}\n"
            f"👤 *Member Name:* {full_name}\n"
            f"📱 *Mobile:* {phone}\n"
            f"📧 *Email:* {email}\n"
            f"🏙️ *City/Address:* {city_address}\n"
            f"🎖️ *Tier:* {membership_type}\n"
            f"💼 *Occupation:* {occupation}\n"
            f"🤝 *Volunteer Interest:* {volunteer}\n\n"
            f"⏱️ *Registered At:* {submitted_time}"
        )
        send_whatsapp_admin_alert(admin_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Membership admin alert failure: {e}", exc_info=True)


# Backward-compatible aliases
notify_admin_and_customer_on_booking = notify_admin_on_booking
notify_admin_and_customer_on_membership = notify_admin_on_membership
notify_admin_and_customer_on_donation = notify_admin_on_donation
