import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)


def get_admin_phone() -> str:
    """
    Returns the target admin WhatsApp phone number.
    Defaults to '9662279799' (+91 9662279799).
    """
    return (
        os.environ.get('WHATSAPP_PHONE_NUMBER')
        or os.environ.get('WHATSAPP_ADMIN_PHONE')
        or '9662279799'
    ).strip()


def send_whatsapp_message(to_phone: str, message_text: str) -> bool:
    """
    Sends a WhatsApp message using WhatsApp Business / Cloud API.
    Configurable via environment variables:
      - WHATSAPP_ENABLED: 'true' / 'false' (default: True)
      - WHATSAPP_PHONE_NUMBER / WHATSAPP_ADMIN_PHONE: default '9662279799'
      - WHATSAPP_ACCESS_TOKEN: Cloud API bearer token
      - WHATSAPP_PHONE_NUMBER_ID: Cloud API Phone Number ID

    Gracefully fails without crashing or raising exceptions so database records are never affected.
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

    # Normalize phone digits: add 91 country code if 10-digit Indian number
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
    1. Admin notification to +919662279799 (or configured WHATSAPP_PHONE_NUMBER)
    2. Customer booking confirmation to devotee's mobile number
    """
    try:
        admin_phone = get_admin_phone()
        name = getattr(booking, 'devotee_name', '')
        phone = getattr(booking, 'phone', '')
        email = getattr(booking, 'email', '')
        city = getattr(booking, 'city', '') or 'Surat'
        booking_date = getattr(booking, 'booking_date', '')
        number_of_devotees = getattr(booking, 'number_of_devotees', 1)

        aarti_type = getattr(booking, 'aarti_type', 'morning')
        if hasattr(booking, 'get_aarti_type_display'):
            aarti_type = booking.get_aarti_type_display()

        # 1. Admin Notification
        admin_message = (
            f"🙏 New Aarti Booking\n\n"
            f"Name: {name}\n"
            f"Mobile: {phone}\n"
            f"Email: {email}\n"
            f"City: {city}\n"
            f"Aarti Date: {booking_date}\n"
            f"Aarti Type: {aarti_type}\n"
            f"Members: {number_of_devotees}"
        )
        send_whatsapp_message(admin_phone, admin_message)

        # 2. Customer Notification (if customer phone available)
        if phone:
            booking_id = getattr(booking, 'booking_id', str(booking.id))
            customer_message = (
                f"🙏 Aarti Booking Confirmed\n\n"
                f"Booking ID: {booking_id}\n"
                f"Devotee: {name}\n"
                f"Date: {booking_date}\n"
                f"Aarti: {aarti_type}\n"
                f"Persons: {number_of_devotees}\n"
                f"City: {city}\n\n"
                f"Please arrive 20 minutes prior to the Aarti.\n"
                f"Ganpati Bappa Morya! 🙏"
            )
            send_whatsapp_message(phone, customer_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Aarti Booking notification handler failure: {e}", exc_info=True)


# Alias
notify_admin_on_booking = notify_admin_and_customer_on_booking


def notify_admin_and_customer_on_membership(membership) -> None:
    """
    Sends WhatsApp notifications on successful Bhakta Membership registration:
    1. Admin notification to +919662279799 (or configured WHATSAPP_PHONE_NUMBER)
    2. Member confirmation message to member's mobile number
    """
    try:
        admin_phone = get_admin_phone()
        full_name = getattr(membership, 'full_name', '')
        phone = getattr(membership, 'phone', '')
        email = getattr(membership, 'email', '')
        city = getattr(membership, 'city', '') or 'Surat'

        if hasattr(membership, 'get_membership_tier_display'):
            membership_type = membership.get_membership_tier_display()
        else:
            membership_type = getattr(membership, 'membership_tier', 'Silver Bhakta')

        # 1. Admin Notification
        admin_message = (
            f"🙏 New Membership Registration\n\n"
            f"Name: {full_name}\n"
            f"Mobile: {phone}\n"
            f"Email: {email}\n"
            f"City: {city}\n"
            f"Membership Type: {membership_type}"
        )
        send_whatsapp_message(admin_phone, admin_message)

        # 2. Member Confirmation Notification
        if phone:
            membership_id = getattr(membership, 'membership_id', str(membership.id))
            volunteer = getattr(membership, 'volunteer', '') or 'Aarti & Ritual Assistance'
            member_message = (
                f"🙏 Pranam {full_name}!\n\n"
                f"Welcome to Surat Cha Gaurinandan Mahotsav 2026.\n"
                f"Your Bhakta Membership Registration is Confirmed.\n\n"
                f"Membership ID: {membership_id}\n"
                f"Volunteer Sewa: {volunteer}\n"
                f"City: {city}\n\n"
                f"Thank you for joining the sacred Mahotsav Sevak family.\n"
                f"Ganpati Bappa Morya! 🌺"
            )
            send_whatsapp_message(phone, member_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Membership notification handler failure: {e}", exc_info=True)


# Alias
notify_admin_on_membership = notify_admin_and_customer_on_membership


def notify_admin_on_donation(donation) -> None:
    """
    Sends WhatsApp notifications on successful Donation submission:
    1. Admin notification to +919662279799 (or configured WHATSAPP_PHONE_NUMBER)
    2. Donor confirmation message to donor's mobile number
    """
    try:
        admin_phone = get_admin_phone()
        name = getattr(donation, 'donor_name', '')
        phone = getattr(donation, 'phone', '')
        email = getattr(donation, 'email', '')
        email_str = email if email and email != 'devotee@suratchagaurinandan.com' else 'N/A'
        raw_amount = getattr(donation, 'amount', '')
        try:
            amt_val = float(raw_amount)
            formatted_amount = f"{int(amt_val)}" if amt_val.is_integer() else f"{amt_val:.2f}"
        except (ValueError, TypeError):
            formatted_amount = str(raw_amount)

        payment_method = getattr(donation, 'payment_method', 'GPay / UPI') or 'GPay / UPI'
        if payment_method == 'upi':
            payment_method = 'GPay / UPI'

        # 1. Admin Notification (Exact User Format)
        admin_message = (
            f"🙏 New Donation Submitted\n\n"
            f"Name: {name}\n"
            f"Mobile: {phone}\n"
            f"Email: {email_str}\n"
            f"Amount: ₹{formatted_amount}\n"
            f"Payment Method: {payment_method}\n"
            f"Status: Pending Verification\n\n"
            f"Please verify the payment in the GPay account."
        )
        send_whatsapp_message(admin_phone, admin_message)

        # 2. Donor Confirmation Notification
        if phone and phone != '9876543210':
            transaction_id = getattr(donation, 'transaction_id', '')
            donor_message = (
                f"🙏 Dhanyawad {name}!\n\n"
                f"Your sacred donation details of ₹{formatted_amount} have been submitted successfully.\n"
                f"Payment Method: {payment_method}\n"
                f"Reference ID: {transaction_id}\n"
                f"Status: Pending Verification\n\n"
                f"Payment confirmation will be verified shortly.\n"
                f"May Lord Ganesha shower you and your family with boundless blessings.\n"
                f"Surat Cha Gaurinandan Trust 🙏"
            )
            send_whatsapp_message(phone, donor_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Donation notification handler failure: {e}", exc_info=True)


# Alias
notify_admin_and_customer_on_donation = notify_admin_on_donation


def notify_admin_on_contact(contact) -> None:
    """
    Sends WhatsApp notification to admin on new contact enquiry:
    Admin notification to +919662279799 (or configured WHATSAPP_PHONE_NUMBER)
    """
    try:
        admin_phone = get_admin_phone()
        name = getattr(contact, 'name', '')
        phone = getattr(contact, 'phone', '') or 'N/A'
        email = getattr(contact, 'email', '')
        subject = getattr(contact, 'subject', '')
        message = getattr(contact, 'message', '')

        # Admin Notification
        admin_message = (
            f"📩 New Contact Enquiry\n\n"
            f"Name: {name}\n"
            f"Mobile: {phone}\n"
            f"Email: {email}\n"
            f"Subject: {subject}\n"
            f"Message: {message}"
        )
        send_whatsapp_message(admin_phone, admin_message)

    except Exception as e:
        logger.error(f"[WhatsApp] Contact enquiry notification handler failure: {e}", exc_info=True)
