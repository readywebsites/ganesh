import re
from datetime import date
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
    class Meta:
        model = AartiBooking
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_booking_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Booking date cannot be in the past.")
        return value

    def validate_number_of_devotees(self, value):
        if value < 1:
            raise serializers.ValidationError("Number of devotees must be at least 1.")
        if value > 20:
            raise serializers.ValidationError("Maximum 20 devotees allowed per single booking.")
        return value

    def validate_phone(self, value):
        clean_phone = re.sub(r'[\s\-\(\)\+]', '', value)
        if not clean_phone.isdigit() or len(clean_phone) < 10 or len(clean_phone) > 15:
            raise serializers.ValidationError("Enter a valid phone number (10 to 15 digits).")
        return value


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

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
        clean_phone = re.sub(r'[\s\-\(\)\+]', '', value)
        if not clean_phone.isdigit() or len(clean_phone) < 10 or len(clean_phone) > 15:
            raise serializers.ValidationError("Enter a valid phone number (10 to 15 digits).")
        return value


class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_full_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters long.")
        return value.strip()

    def validate_phone(self, value):
        clean_phone = re.sub(r'[\s\-\(\)\+]', '', value)
        if not clean_phone.isdigit() or len(clean_phone) < 10 or len(clean_phone) > 15:
            raise serializers.ValidationError("Enter a valid phone number (10 to 15 digits).")
        return value


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_subject(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters long.")
        return value.strip()

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value.strip()
