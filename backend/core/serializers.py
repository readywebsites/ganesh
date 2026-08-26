import uuid
import re
from datetime import date
from django.db import models
from rest_framework import serializers
from .models import Gallery, AartiBooking, Donation, Membership, Contact


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value.strip()

    def validate_image(self, value):
        if value:
            max_size = 10 * 1024 * 1024  # 10 MB
            if value.size > max_size:
                raise serializers.ValidationError("Image file size cannot exceed 10 MB.")
        return value


class AartiBookingSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(read_only=True)
    bookingId = serializers.CharField(source='booking_id', read_only=True)
    name = serializers.CharField(source='devotee_name', required=False)
    mobile = serializers.CharField(source='phone', required=False)
    date = serializers.DateField(source='booking_date', required=False)
    slot = serializers.CharField(source='aarti_type', required=False)
    aarti = serializers.CharField(source='aarti_type', required=False)
    members = serializers.IntegerField(source='number_of_devotees', required=False)
    specialNote = serializers.CharField(source='notes', required=False, allow_blank=True)

    class Meta:
        model = AartiBooking
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'booking_id', 'bookingId')

    def to_internal_value(self, data):
        # Work on a mutable copy of data
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Map frontend field aliases to model field names
        if 'name' in mutable_data and 'devotee_name' not in mutable_data:
            mutable_data['devotee_name'] = mutable_data['name']
        if 'mobile' in mutable_data and 'phone' not in mutable_data:
            mutable_data['phone'] = mutable_data['mobile']
        if 'date' in mutable_data and 'booking_date' not in mutable_data:
            mutable_data['booking_date'] = mutable_data['date']
        if 'members' in mutable_data and 'number_of_devotees' not in mutable_data:
            mutable_data['number_of_devotees'] = mutable_data['members']
        if 'specialNote' in mutable_data and 'notes' not in mutable_data:
            mutable_data['notes'] = mutable_data['specialNote']
        if 'city' not in mutable_data or not str(mutable_data.get('city', '')).strip():
            mutable_data['city'] = 'Surat'

        # Normalize slot / aarti_type
        raw_slot = mutable_data.get('slot') or mutable_data.get('aarti') or mutable_data.get('aarti_type') or ''
        raw_str = str(raw_slot).lower().strip()
        if 'morning' in raw_str or 'mangala' in raw_str or 'rajbhog' in raw_str or '9:00' in raw_str or raw_str == 'am':
            mutable_data['aarti_type'] = 'morning'
        elif 'night' in raw_str or 'evening' in raw_str or 'sandhya' in raw_str or 'shej' in raw_str or '8:00' in raw_str or raw_str == 'pm':
            mutable_data['aarti_type'] = 'night'

        return super().to_internal_value(mutable_data)

    def validate_devotee_name(self, value):
        name = value.strip()
        if len(name) < 2:
            raise serializers.ValidationError("Devotee name must be at least 2 characters long.")
        return name

    def validate_booking_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return value

    def validate_number_of_devotees(self, value):
        if value < 1:
            raise serializers.ValidationError("Number of devotees must be at least 1.")
        if value > 5:
            raise serializers.ValidationError("Maximum 5 devotees allowed per Aarti booking.")
        return value

    def validate_phone(self, value):
        clean_phone = re.sub(r'[\s\-\(\)\+]', '', str(value))
        if clean_phone.startswith('91') and len(clean_phone) == 12:
            clean_phone = clean_phone[2:]
        if not clean_phone.isdigit() or len(clean_phone) != 10:
            raise serializers.ValidationError("Enter a valid 10-digit mobile number.")
        return clean_phone

    def validate(self, attrs):
        booking_date = attrs.get('booking_date')
        aarti_type = attrs.get('aarti_type', 'morning')
        number_of_devotees = attrs.get('number_of_devotees', 1)

        # Determine existing slot allocations
        if booking_date and aarti_type:
            morning_types = ['morning', 'mangala', 'rajbhog']
            night_types = ['night', 'sandhya', 'shej']
            type_filter = morning_types if aarti_type in morning_types else night_types

            # Exclude current instance if updating
            qs = AartiBooking.objects.filter(
                booking_date=booking_date,
                aarti_type__in=type_filter,
                status__in=['confirmed', 'pending']
            )
            if self.instance and self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)

            booked_total = qs.aggregate(total=models.Sum('number_of_devotees'))['total'] or 0
            max_capacity = 5
            remaining = max(0, max_capacity - booked_total)
            slot_name = "Morning Aarti" if aarti_type in morning_types else "Night Aarti"

            if remaining <= 0:
                raise serializers.ValidationError(
                    f"{slot_name} is sold out for {booking_date}."
                )
            if number_of_devotees > remaining:
                raise serializers.ValidationError(
                    f"Only {remaining} seat(s) remaining for {slot_name} on {booking_date}. You requested {number_of_devotees}."
                )

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Expose helpful aliases for frontend compatibility
        is_morning = instance.aarti_type in ['morning', 'mangala', 'rajbhog']
        slot_label = "Morning Aarti" if is_morning else "Night Aarti"
        time_label = "09:00 AM" if is_morning else "08:00 PM"

        data['booking_id'] = instance.booking_id
        data['bookingId'] = instance.booking_id
        data['name'] = instance.devotee_name
        data['mobile'] = instance.phone
        data['date'] = str(instance.booking_date)
        data['slot'] = slot_label
        data['aarti'] = slot_label
        data['time'] = time_label
        data['members'] = instance.number_of_devotees
        data['specialNote'] = instance.notes
        data['createdAt'] = instance.created_at.isoformat() if instance.created_at else None
        return data


class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(required=False)
    name = serializers.CharField(source='donor_name', required=False)
    transaction_id = serializers.CharField(required=False)
    transactionId = serializers.CharField(source='transaction_id', required=False)
    payment_method = serializers.CharField(required=False, default='GPay / UPI')
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False)

    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)

        if 'name' in mutable_data and 'donor_name' not in mutable_data:
            mutable_data['donor_name'] = mutable_data['name']
        if 'donorName' in mutable_data and 'donor_name' not in mutable_data:
            mutable_data['donor_name'] = mutable_data['donorName']

        if 'mobile' in mutable_data and 'phone' not in mutable_data:
            mutable_data['phone'] = mutable_data['mobile']

        if 'paymentMethod' in mutable_data and 'payment_method' not in mutable_data:
            mutable_data['payment_method'] = mutable_data['paymentMethod']

        if 'payment_method' not in mutable_data or not str(mutable_data.get('payment_method', '')).strip():
            mutable_data['payment_method'] = 'GPay / UPI'
        elif str(mutable_data.get('payment_method')).lower() == 'upi':
            mutable_data['payment_method'] = 'GPay / UPI'

        if 'transactionId' in mutable_data and 'transaction_id' not in mutable_data:
            mutable_data['transaction_id'] = mutable_data['transactionId']
        if 'transaction_id' not in mutable_data or not str(mutable_data.get('transaction_id', '')).strip():
            short_uuid = uuid.uuid4().hex[:8].upper()
            mutable_data['transaction_id'] = f"TXN-GPAY-{short_uuid}"

        if 'email' in mutable_data and not str(mutable_data.get('email', '')).strip():
            mutable_data['email'] = ''

        if 'phone' not in mutable_data or not str(mutable_data.get('phone', '')).strip():
            mutable_data['phone'] = '9876543210'

        # Map status / paymentStatus / payment_status
        status_in = None
        if 'status' in mutable_data:
            status_in = str(mutable_data['status']).lower()
        elif 'paymentStatus' in mutable_data:
            status_in = str(mutable_data['paymentStatus']).lower()
        elif 'payment_status' in mutable_data:
            status_in = str(mutable_data['payment_status']).lower()

        if status_in:
            if status_in in ['success', 'verified', 'approved']:
                mutable_data['status'] = 'verified'
            elif status_in in ['rejected', 'failed']:
                mutable_data['status'] = 'rejected'
            elif status_in in ['refunded']:
                mutable_data['status'] = 'refunded'
            else:
                mutable_data['status'] = 'pending'

        return super().to_internal_value(mutable_data)

    def validate_donor_name(self, value):
        name = value.strip()
        if len(name) < 2:
            raise serializers.ValidationError("Donor name must be at least 2 characters long.")
        return name

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Donation amount must be greater than 0.")
        return value

    def validate_transaction_id(self, value):
        clean_tx = value.strip()
        if not clean_tx:
            raise serializers.ValidationError("Transaction ID cannot be empty.")
        return clean_tx

    def validate_phone(self, value):
        clean_phone = re.sub(r'[\s\-\(\)\+]', '', str(value))
        if clean_phone.startswith('91') and len(clean_phone) == 12:
            clean_phone = clean_phone[2:]
        if not clean_phone.isdigit() or len(clean_phone) < 10 or len(clean_phone) > 15:
            raise serializers.ValidationError("Enter a valid phone number (10 to 15 digits).")
        return clean_phone

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['_id'] = str(instance.id)
        data['name'] = instance.donor_name
        data['donor_name'] = instance.donor_name
        data['transactionId'] = instance.transaction_id
        data['transaction_id'] = instance.transaction_id
        data['amount'] = float(instance.amount) if instance.amount is not None else 0.0
        data['paymentStatus'] = 'SUCCESS' if instance.status == 'verified' else ('REJECTED' if instance.status == 'rejected' else 'PENDING')
        data['payment_status'] = data['paymentStatus']
        data['status'] = instance.status
        data['payment_method'] = instance.payment_method or 'GPay / UPI'
        data['paymentMethod'] = instance.payment_method or 'GPay / UPI'
        data['createdAt'] = instance.created_at.isoformat() if instance.created_at else None
        data['date'] = instance.created_at.strftime('%Y-%m-%d') if instance.created_at else None
        return data


class MembershipSerializer(serializers.ModelSerializer):
    membership_id = serializers.CharField(read_only=True)
    membershipId = serializers.CharField(source='membership_id', read_only=True)
    name = serializers.CharField(source='full_name', required=False)
    mobile = serializers.CharField(source='phone', required=False)

    class Meta:
        model = Membership
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'membership_id', 'membershipId')

    def to_internal_value(self, data):
        # Work on a mutable copy of data
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)

        # Map frontend field aliases to model field names
        if 'name' in mutable_data and 'full_name' not in mutable_data:
            mutable_data['full_name'] = mutable_data['name']
        if 'mobile' in mutable_data and 'phone' not in mutable_data:
            mutable_data['phone'] = mutable_data['mobile']
        if 'city' in mutable_data and not str(mutable_data.get('city', '')).strip():
            mutable_data['city'] = 'Surat'
        if 'volunteer' in mutable_data and not str(mutable_data.get('volunteer', '')).strip():
            mutable_data['volunteer'] = 'Aarti & Ritual Assistance'

        return super().to_internal_value(mutable_data)

    def validate_full_name(self, value):
        name = value.strip()
        if len(name) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters long.")
        return name

    def validate_phone(self, value):
        clean_phone = re.sub(r'[\s\-\(\)\+]', '', str(value))
        if clean_phone.startswith('91') and len(clean_phone) == 12:
            clean_phone = clean_phone[2:]
        if not clean_phone.isdigit() or len(clean_phone) != 10:
            raise serializers.ValidationError("Enter a valid 10-digit mobile number.")
        return clean_phone

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Expose helpful aliases for frontend compatibility
        data['membership_id'] = instance.membership_id
        data['membershipId'] = instance.membership_id
        data['_id'] = str(instance.id)
        data['name'] = instance.full_name
        data['mobile'] = instance.phone
        data['createdAt'] = instance.created_at.isoformat() if instance.created_at else None
        return data


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'subject' not in mutable_data or not str(mutable_data.get('subject', '')).strip():
            mutable_data['subject'] = 'General Pilgrim Inquiry'
        elif len(str(mutable_data.get('subject', '')).strip()) < 3:
            mutable_data['subject'] = f"{str(mutable_data.get('subject', '')).strip()} - Inquiry"
        return super().to_internal_value(mutable_data)

    def validate_name(self, value):
        name = value.strip()
        if len(name) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return name

    def validate_subject(self, value):
        sub = value.strip()
        if len(sub) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters long.")
        return sub

    def validate_message(self, value):
        msg = value.strip()
        if len(msg) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return msg

    def validate_phone(self, value):
        if not value:
            return ""
        clean_phone = re.sub(r'[\s\-\(\)\+]', '', str(value))
        if clean_phone.startswith('91') and len(clean_phone) == 12:
            clean_phone = clean_phone[2:]
        if clean_phone and (not clean_phone.isdigit() or len(clean_phone) < 10 or len(clean_phone) > 15):
            raise serializers.ValidationError("Enter a valid phone number (10 to 15 digits).")
        return clean_phone

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['_id'] = str(instance.id)
        data['createdAt'] = instance.created_at.isoformat() if instance.created_at else None
        data['date'] = instance.created_at.strftime('%Y-%m-%d') if instance.created_at else None
        return data
