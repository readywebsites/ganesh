import json
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import AartiBooking, Membership, Donation, Contact
from .whatsapp import (
    notify_admin_and_customer_on_booking,
    notify_admin_and_customer_on_membership,
    send_whatsapp_message,
)


class AartiBookingCapacityAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_date_1 = '2026-09-14'
        self.test_date_2 = '2026-09-15'

    def test_case_1_new_date_morning_1_person(self):
        """Case 1: New date + Morning + 1 person -> SUCCESS, Database record created"""
        payload = {
            "name": "Aarav Patel",
            "mobile": "9876543210",
            "email": "aarav@example.com",
            "city": "Surat",
            "date": self.test_date_1,
            "slot": "Morning Aarti",
            "members": 1,
            "specialNote": "Senior citizen with us",
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('booking', response.data)
        self.assertEqual(response.data['booking']['name'], "Aarav Patel")
        self.assertEqual(response.data['booking']['city'], "Surat")
        self.assertEqual(response.data['booking']['members'], 1)

        # Check DB record
        booking = AartiBooking.objects.get(email="aarav@example.com")
        self.assertEqual(booking.devotee_name, "Aarav Patel")
        self.assertEqual(booking.phone, "9876543210")
        self.assertEqual(booking.city, "Surat")
        self.assertEqual(booking.number_of_devotees, 1)
        self.assertEqual(booking.aarti_type, "morning")
        self.assertEqual(str(booking.booking_date), self.test_date_1)

        # Check availability
        avail_res = self.client.get(f'/api/aarti-bookings/availability/?date={self.test_date_1}')
        self.assertEqual(avail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(avail_res.data['morning']['booked'], 1)
        self.assertEqual(avail_res.data['morning']['remaining'], 4)
        self.assertFalse(avail_res.data['morning']['is_full'])
        self.assertEqual(avail_res.data['night']['booked'], 0)
        self.assertEqual(avail_res.data['night']['remaining'], 5)

    def test_case_2_same_date_morning_4_persons_sold_out(self):
        """Case 2: Same date + Morning + 4 persons -> SUCCESS -> Morning becomes 5/5 SOLD OUT"""
        # First booking: 1 person
        AartiBooking.objects.create(
            devotee_name="Bhakta 1",
            email="bhakta1@example.com",
            phone="9876543211",
            city="Surat",
            booking_date=self.test_date_1,
            aarti_type="morning",
            number_of_devotees=1,
            status="confirmed",
        )

        # Second booking: 4 persons
        payload = {
            "name": "Bhakta 2",
            "mobile": "9876543212",
            "email": "bhakta2@example.com",
            "city": "Ahmedabad",
            "date": self.test_date_1,
            "slot": "Morning Aarti",
            "members": 4,
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check availability -> Morning must be SOLD OUT (5/5)
        avail_res = self.client.get(f'/api/aarti-bookings/availability/?date={self.test_date_1}')
        self.assertEqual(avail_res.data['morning']['booked'], 5)
        self.assertEqual(avail_res.data['morning']['remaining'], 0)
        self.assertTrue(avail_res.data['morning']['is_full'])

    def test_case_3_same_date_morning_overbooking_rejected(self):
        """Case 3: Same date + Morning + 1 person when already 5 booked -> REJECTED (SOLD OUT)"""
        AartiBooking.objects.create(
            devotee_name="Bhakta Full",
            email="full@example.com",
            phone="9876543213",
            city="Surat",
            booking_date=self.test_date_1,
            aarti_type="morning",
            number_of_devotees=5,
            status="confirmed",
        )

        payload = {
            "name": "Extra Devotee",
            "mobile": "9876543214",
            "email": "extra@example.com",
            "city": "Surat",
            "date": self.test_date_1,
            "slot": "Morning Aarti",
            "members": 1,
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn("sold out", response.data['message'].lower())

    def test_case_4_same_date_night_5_persons_sold_out(self):
        """Case 4: Same date + Night + 5 persons -> SUCCESS -> Night SOLD OUT"""
        payload = {
            "name": "Night Devotee Group",
            "mobile": "9876543215",
            "email": "nightgroup@example.com",
            "city": "Surat",
            "date": self.test_date_1,
            "slot": "Night Aarti",
            "members": 5,
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        avail_res = self.client.get(f'/api/aarti-bookings/availability/?date={self.test_date_1}')
        self.assertEqual(avail_res.data['night']['booked'], 5)
        self.assertEqual(avail_res.data['night']['remaining'], 0)
        self.assertTrue(avail_res.data['night']['is_full'])

    def test_case_5_morning_and_night_capacities_independent(self):
        """Case 5: Same date + Morning and Night -> Capacities remain independent"""
        # Fill Morning completely (5/5)
        AartiBooking.objects.create(
            devotee_name="Morning Full",
            email="morning@example.com",
            phone="9876543216",
            booking_date=self.test_date_1,
            aarti_type="morning",
            number_of_devotees=5,
            status="confirmed",
        )

        # Night should still be available with 5/5 remaining
        avail_res = self.client.get(f'/api/aarti-bookings/availability/?date={self.test_date_1}')
        self.assertTrue(avail_res.data['morning']['is_full'])
        self.assertEqual(avail_res.data['morning']['remaining'], 0)
        self.assertFalse(avail_res.data['night']['is_full'])
        self.assertEqual(avail_res.data['night']['remaining'], 5)

        # Booking Night should succeed
        payload = {
            "name": "Night Bhakta",
            "mobile": "9876543217",
            "email": "nightbhakta@example.com",
            "date": self.test_date_1,
            "slot": "Night Aarti",
            "members": 2,
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_case_6_different_date_fresh_capacity(self):
        """Case 6: Different date -> Fresh 5 + 5 capacity, bookings on one date never affect another"""
        # Fill 2026-09-14 completely for both slots
        AartiBooking.objects.create(
            devotee_name="Morning D1",
            email="d1m@example.com",
            phone="9876543218",
            booking_date=self.test_date_1,
            aarti_type="morning",
            number_of_devotees=5,
            status="confirmed",
        )
        AartiBooking.objects.create(
            devotee_name="Night D1",
            email="d1n@example.com",
            phone="9876543219",
            booking_date=self.test_date_1,
            aarti_type="night",
            number_of_devotees=5,
            status="confirmed",
        )

        # Verify 2026-09-15 has fresh 5 + 5 capacity
        avail_res = self.client.get(f'/api/aarti-bookings/availability/?date={self.test_date_2}')
        self.assertEqual(avail_res.data['morning']['booked'], 0)
        self.assertEqual(avail_res.data['morning']['remaining'], 5)
        self.assertFalse(avail_res.data['morning']['is_full'])
        self.assertEqual(avail_res.data['night']['booked'], 0)
        self.assertEqual(avail_res.data['night']['remaining'], 5)
        self.assertFalse(avail_res.data['night']['is_full'])

    def test_case_7_admin_fields_and_booking_id(self):
        """Case 7: Admin visibility and formatted booking ID"""
        booking = AartiBooking.objects.create(
            devotee_name="Pooja Sharma",
            email="pooja@example.com",
            phone="9876543220",
            city="Navsari",
            booking_date="2026-09-18",
            aarti_type="morning",
            number_of_devotees=3,
            notes="Requires wheel chair assistance",
            status="confirmed",
        )
        self.assertTrue(booking.booking_id.startswith("AB-20260918-"))
        self.assertEqual(booking.city, "Navsari")
        self.assertEqual(booking.notes, "Requires wheel chair assistance")

    def test_case_8_whatsapp_safe_execution_and_mock(self):
        """Case 8: WhatsApp notifications sent safely, failures never break booking"""
        booking = AartiBooking.objects.create(
            devotee_name="Ramesh Joshi",
            email="ramesh@example.com",
            phone="9876543221",
            city="Surat",
            booking_date="2026-09-20",
            aarti_type="night",
            number_of_devotees=2,
            notes="Family darshan",
            status="confirmed",
        )

        # Test safe execution when unconfigured (should return False and not raise)
        with patch.dict('os.environ', {'WHATSAPP_ACCESS_TOKEN': '', 'WHATSAPP_PHONE_NUMBER_ID': ''}):
            notify_admin_and_customer_on_booking(booking)

        # Test when configured with mock
        with patch('core.whatsapp.send_whatsapp_message') as mock_send:
            notify_admin_and_customer_on_booking(booking)
            self.assertEqual(mock_send.call_count, 2)
            # Verify admin call
            admin_call_args = mock_send.call_args_list[0][0]
            self.assertEqual(admin_call_args[0], '9662279799')
            self.assertIn("New Aarti Booking", admin_call_args[1])
            self.assertIn("Ramesh Joshi", admin_call_args[1])
            self.assertIn("9876543221", admin_call_args[1])
            # Verify customer call
            customer_call_args = mock_send.call_args_list[1][0]
            self.assertEqual(customer_call_args[0], '9876543221')
            self.assertIn("Aarti Booking Confirmed", customer_call_args[1])

    def test_partial_capacity_exceeded_message(self):
        """Test user-friendly error when requesting more members than remaining seats"""
        AartiBooking.objects.create(
            devotee_name="Existing 3 Devotees",
            email="ex3@example.com",
            phone="9876543222",
            city="Surat",
            booking_date=self.test_date_1,
            aarti_type="morning",
            number_of_devotees=3,
            status="confirmed",
        )
        # Attempt to book 3 devotees (only 2 seats remaining)
        payload = {
            "name": "New 3 Devotees",
            "mobile": "9876543223",
            "email": "new3@example.com",
            "city": "Surat",
            "date": self.test_date_1,
            "slot": "Morning Aarti",
            "members": 3,
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only 2 seat(s) remaining", response.data['message'])


class MembershipAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin_test',
            email='admin_test@example.com',
            password='testpassword123'
        )

    def test_public_user_can_submit_membership(self):
        """Public user can submit membership registration without credentials"""
        payload = {
            "name": "Rajesh Kumar Sharma",
            "mobile": "9876543210",
            "email": "rajesh@example.com",
            "city": "Surat",
            "address": "101, Gaurav Heights, Adajan",
            "occupation": "Businessman",
            "volunteer": "Aarti & Ritual Assistance",
        }
        response = self.client.post('/api/memberships/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('membership', response.data)
        self.assertIn('membershipId', response.data)
        self.assertTrue(response.data['membershipId'].startswith('GMN-2026-'))

        # Verify record in DB
        member = Membership.objects.get(email="rajesh@example.com")
        self.assertEqual(member.full_name, "Rajesh Kumar Sharma")
        self.assertEqual(member.phone, "9876543210")
        self.assertEqual(member.city, "Surat")
        self.assertEqual(member.address, "101, Gaurav Heights, Adajan")
        self.assertEqual(member.occupation, "Businessman")
        self.assertEqual(member.volunteer, "Aarti & Ritual Assistance")
        self.assertEqual(member.status, "active")

    def test_unauthenticated_get_list_is_denied(self):
        """Unauthenticated user cannot GET /api/memberships/ (returns 403 Forbidden)"""
        response = self.client.get('/api/memberships/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_staff_can_access_memberships(self):
        """Authenticated staff/admin can list and retrieve memberships"""
        Membership.objects.create(
            full_name="Pooja Mehta",
            email="pooja@example.com",
            phone="9876543211",
            city="Surat",
            address="Ring Road",
            occupation="Teacher",
            volunteer="Prasadam Distribution Sewa",
            status="active"
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/memberships/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['name'], "Pooja Mehta")

    def test_validation_invalid_phone_and_short_name(self):
        """Validation fails on invalid mobile number and too short full name"""
        # Invalid phone
        payload = {
            "name": "Valid Name",
            "mobile": "123",
            "email": "valid@example.com",
            "city": "Surat",
        }
        res = self.client.post('/api/memberships/', data=payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.data['success'])

        # Short name
        payload2 = {
            "name": "A",
            "mobile": "9876543210",
            "email": "valid2@example.com",
            "city": "Surat",
        }
        res2 = self.client.post('/api/memberships/', data=payload2, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res2.data['success'])

    def test_whatsapp_safe_execution_on_membership(self):
        """WhatsApp failure does not prevent membership database save"""
        member = Membership.objects.create(
            full_name="Vikram Sethi",
            email="vikram@example.com",
            phone="9876543212",
            city="Surat",
            address="Vesu",
            occupation="Architect",
            volunteer="Media & Photography Team",
            status="active"
        )

        # Test unconfigured credentials (graceful return False without error)
        with patch.dict('os.environ', {'WHATSAPP_ACCESS_TOKEN': '', 'WHATSAPP_PHONE_NUMBER_ID': ''}):
            notify_admin_and_customer_on_membership(member)

        # Test configured credentials with mock
        with patch('core.whatsapp.send_whatsapp_message') as mock_send:
            notify_admin_and_customer_on_membership(member)
            self.assertEqual(mock_send.call_count, 2)
            admin_args = mock_send.call_args_list[0][0]
            self.assertEqual(admin_args[0], '9662279799')
            self.assertIn("New Ganesh Membership Registration", admin_args[1])
            self.assertIn("Vikram Sethi", admin_args[1])
            self.assertIn("9876543212", admin_args[1])
            member_args = mock_send.call_args_list[1][0]
            self.assertEqual(member_args[0], '9876543212')
            self.assertIn("Welcome to Surat Cha Gaurinandan Mahotsav", member_args[1])


class DonationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin_donations',
            email='admin_donations@example.com',
            password='testpassword123'
        )

    def test_public_user_can_submit_donation(self):
        """Public devotee can submit donation transfer details without authentication"""
        payload = {
            "name": "Ramesh Bhai Patel",
            "amount": 1001,
            "transactionId": "TXN98765432101",
            "email": "ramesh@example.com",
            "phone": "9876543210",
            "notes": "Mahaprasad Sewa",
        }
        response = self.client.post('/api/donations/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('donation', response.data)
        self.assertEqual(response.data['donation']['name'], "Ramesh Bhai Patel")
        self.assertEqual(response.data['donation']['amount'], 1001.0)
        self.assertEqual(response.data['donation']['transactionId'], "TXN98765432101")

        # Verify DB record
        donation = Donation.objects.get(transaction_id="TXN98765432101")
        self.assertEqual(donation.donor_name, "Ramesh Bhai Patel")
        self.assertEqual(donation.amount, 1001)
        self.assertEqual(donation.email, "ramesh@example.com")
        self.assertEqual(donation.phone, "9876543210")

    def test_unauthenticated_get_list_is_denied(self):
        """Unauthenticated user cannot list donations"""
        response = self.client.get('/api/donations/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_staff_can_list_donations(self):
        """Authenticated staff/admin can list donations and view total amount"""
        Donation.objects.create(
            donor_name="Kishore Shah",
            email="kishore@example.com",
            phone="9876543211",
            amount=5000,
            transaction_id="TXN-5000-01",
            status="verified"
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/donations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['name'], "Kishore Shah")
        self.assertEqual(response.data['totalAmount'], 5000.0)

    def test_donation_validation_invalid_amount_and_name(self):
        """Validation fails when amount <= 0 or donor name too short"""
        payload = {
            "name": "K",
            "amount": 0,
            "transactionId": "TXN-INV-01",
        }
        response = self.client.post('/api/donations/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])


class ContactAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin_contacts',
            email='admin_contacts@example.com',
            password='testpassword123'
        )

    def test_public_user_can_submit_contact_message(self):
        """Public user can send contact inquiry without authentication"""
        payload = {
            "name": "Ananya Desai",
            "email": "ananya@example.com",
            "phone": "9876543210",
            "subject": "VIP Darshan Inquiry",
            "message": "We would like information regarding wheelchair accessibility for senior citizens.",
        }
        response = self.client.post('/api/contacts/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('contact', response.data)
        self.assertEqual(response.data['contact']['name'], "Ananya Desai")

        # Verify DB record
        contact = Contact.objects.get(email="ananya@example.com")
        self.assertEqual(contact.name, "Ananya Desai")
        self.assertEqual(contact.subject, "VIP Darshan Inquiry")
        self.assertEqual(contact.status, "new")

    def test_unauthenticated_get_list_is_denied(self):
        """Unauthenticated user cannot list contact messages"""
        response = self.client.get('/api/contacts/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_staff_can_list_and_update_contact(self):
        """Authenticated admin can list contacts and update status/reply"""
        c = Contact.objects.create(
            name="Devendra Joshi",
            email="devendra@example.com",
            subject="Prasadam Timings",
            message="What are the daily Mahaprasadam distribution timings?",
            status="new"
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/contacts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)

        # Update contact
        update_res = self.client.patch(f'/api/contacts/{c.id}/', data={"status": "resolved"}, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        c.refresh_from_db()
        self.assertEqual(c.status, "resolved")

    def test_contact_validation_short_message(self):
        """Validation fails when message is shorter than 10 characters"""
        payload = {
            "name": "Ananya Desai",
            "email": "ananya@example.com",
            "subject": "VIP Inquiry",
            "message": "Hi",
        }
        response = self.client.post('/api/contacts/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

