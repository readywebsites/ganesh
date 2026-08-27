import json
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import AartiBooking, Membership, Donation, Contact, Event
from .whatsapp import (
    notify_admin_and_customer_on_booking,
    notify_admin_and_customer_on_membership,
    notify_admin_on_donation,
    notify_admin_on_contact,
    send_whatsapp_message,
    get_admin_phone,
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
            self.assertIn("NEW AARTI BOOKING", admin_call_args[1].upper())
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
            self.assertIn("NEW MEMBERSHIP REGISTRATION", admin_args[1].upper())
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

    def test_public_user_can_submit_gpay_donation_without_email(self):
        """Public devotee can submit GPay / UPI donation with optional email and auto txn"""
        payload = {
            "name": "Hiren Patel",
            "phone": "9662279799",
            "email": "",
            "amount": 501,
            "paymentMethod": "GPay / UPI",
        }
        response = self.client.post('/api/donations/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['donation']['name'], "Hiren Patel")
        self.assertEqual(response.data['donation']['amount'], 501.0)
        self.assertEqual(response.data['donation']['paymentStatus'], "PENDING")
        self.assertEqual(response.data['donation']['paymentMethod'], "GPay / UPI")

    def test_admin_staff_can_update_donation_status(self):
        """Admin can change donation status to SUCCESS or REJECTED"""
        donation = Donation.objects.create(
            donor_name="Pooja Sharma",
            email="pooja@example.com",
            phone="9876543212",
            amount=2100,
            transaction_id="TXN-STAT-01",
            status="pending"
        )
        self.client.force_authenticate(user=self.admin_user)
        # Update to SUCCESS
        response = self.client.patch(f'/api/donations/{donation.id}/', data={"paymentStatus": "SUCCESS"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['donation']['paymentStatus'], "SUCCESS")
        donation.refresh_from_db()
        self.assertEqual(donation.status, "verified")

        # Update to REJECTED
        response = self.client.patch(f'/api/donations/{donation.id}/', data={"status": "rejected"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['donation']['paymentStatus'], "REJECTED")
        donation.refresh_from_db()
        self.assertEqual(donation.status, "rejected")


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
        self.assertEqual(response.data['message'], "Contact message submitted successfully.")
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


class CSRFExemptionAndPublicFormsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.admin_user = User.objects.create_superuser(
            username='admin_csrf_test',
            email='admin_csrf@example.com',
            password='testpassword123'
        )

    def test_aarti_booking_post_without_csrf_succeeds(self):
        """Anonymous browser client without CSRF token can submit Aarti Booking successfully"""
        payload = {
            "name": "Browser Devotee",
            "mobile": "9876543210",
            "email": "browser@example.com",
            "city": "Surat",
            "date": "2026-09-22",
            "slot": "Morning Aarti",
            "members": 2,
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(AartiBooking.objects.filter(email="browser@example.com").exists())

    def test_membership_post_without_csrf_succeeds(self):
        """Anonymous browser client without CSRF token can submit Membership successfully"""
        payload = {
            "name": "Bhakta Sevak",
            "mobile": "9876543210",
            "email": "bhakta.sevak@example.com",
            "city": "Surat",
            "address": "Gaurinandan Marg",
            "occupation": "Trader",
            "volunteer": "Aarti & Ritual Assistance",
        }
        response = self.client.post('/api/memberships/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(Membership.objects.filter(email="bhakta.sevak@example.com").exists())

    def test_donation_post_without_csrf_succeeds(self):
        """Anonymous browser client without CSRF token can submit Donation successfully"""
        payload = {
            "name": "Generous Donor",
            "amount": 2500,
            "transactionId": "TXN-CSRF-TEST-01",
            "email": "donor@example.com",
            "phone": "9876543210",
        }
        response = self.client.post('/api/donations/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(Donation.objects.filter(transaction_id="TXN-CSRF-TEST-01").exists())

    def test_contact_post_without_csrf_succeeds(self):
        """Anonymous browser client without CSRF token can submit Contact inquiry successfully"""
        payload = {
            "name": "Inquiry Devotee",
            "email": "inquiry@example.com",
            "phone": "9876543210",
            "subject": "Darshan Timings",
            "message": "Please confirm the special darshan timings for Chaturthi.",
        }
        response = self.client.post('/api/contacts/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(Contact.objects.filter(email="inquiry@example.com").exists())

    def test_logged_in_session_aarti_booking_without_csrf_succeeds(self):
        """When an admin user is logged in (session active), public Aarti Booking POST still succeeds without CSRF error"""
        self.client.force_login(self.admin_user)
        payload = {
            "name": "Admin Submitting Aarti",
            "mobile": "9876543210",
            "email": "admin_aarti@example.com",
            "city": "Surat",
            "date": "2026-09-23",
            "slot": "Night Aarti",
            "members": 1,
        }
        response = self.client.post('/api/aarti-bookings/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(AartiBooking.objects.filter(email="admin_aarti@example.com").exists())

    def test_logged_in_session_membership_without_csrf_succeeds(self):
        """When an admin user is logged in (session active), public Membership POST still succeeds without CSRF error"""
        self.client.force_login(self.admin_user)
        payload = {
            "name": "Admin Submitting Membership",
            "mobile": "9876543210",
            "email": "admin_member@example.com",
            "city": "Surat",
            "address": "VIP Road",
            "occupation": "Trustee",
            "volunteer": "Aarti & Ritual Assistance",
        }
        response = self.client.post('/api/memberships/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(Membership.objects.filter(email="admin_member@example.com").exists())

    def test_logged_in_session_donation_without_csrf_succeeds(self):
        """When an admin user is logged in (session active), public Donation POST still succeeds without CSRF error"""
        self.client.force_login(self.admin_user)
        payload = {
            "name": "Admin Submitting Donation",
            "amount": 5001,
            "transactionId": "TXN-SESSION-LOGGEDIN-01",
            "email": "admin_donor@example.com",
            "phone": "9876543210",
        }
        response = self.client.post('/api/donations/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(Donation.objects.filter(transaction_id="TXN-SESSION-LOGGEDIN-01").exists())

    def test_logged_in_session_contact_without_csrf_succeeds(self):
        """When an admin user is logged in (session active), public Contact POST still succeeds without CSRF error"""
        self.client.force_login(self.admin_user)
        payload = {
            "name": "Admin Submitting Contact",
            "email": "admin_contact@example.com",
            "phone": "9876543210",
            "subject": "Admin Query",
            "message": "Testing public contact submission with active session in browser.",
        }
        response = self.client.post('/api/contacts/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(Contact.objects.filter(email="admin_contact@example.com").exists())


class LegacyAliasesAndPermissionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin_legacy_test',
            email='admin_legacy@example.com',
            password='testpassword123'
        )

    def test_legacy_aarti_slots_and_book_routes(self):
        """Test legacy aarti routes /api/aarti/slots/ and /api/aarti/book/"""
        # GET availability
        res_avail = self.client.get('/api/aarti/slots/?date=2026-09-14')
        self.assertEqual(res_avail.status_code, status.HTTP_200_OK)
        self.assertTrue(res_avail.data['success'])

        # POST book
        payload = {
            "name": "Legacy Devotee",
            "mobile": "9876543210",
            "email": "legacy_aarti@example.com",
            "date": "2026-09-14",
            "slot": "Morning Aarti",
            "members": 1,
        }
        res_book = self.client.post('/api/aarti/book/', data=payload, format='json')
        self.assertEqual(res_book.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_book.data['success'])
        self.assertTrue(AartiBooking.objects.filter(email="legacy_aarti@example.com").exists())

    def test_legacy_membership_register_routes(self):
        """Test legacy membership routes /api/members/register/ and /api/membership/register/"""
        payload = {
            "name": "Legacy Member",
            "mobile": "9876543210",
            "email": "legacy_member@example.com",
            "city": "Surat",
        }
        res1 = self.client.post('/api/members/register/', data=payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res1.data['success'])

        payload2 = {
            "name": "Legacy Member 2",
            "mobile": "9876543211",
            "email": "legacy_member2@example.com",
            "city": "Surat",
        }
        res2 = self.client.post('/api/membership/register/', data=payload2, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res2.data['success'])

    def test_legacy_donation_and_contact_create_routes(self):
        """Test legacy donation /api/donations/create/ and contact /api/contacts/send/"""
        # Donation create
        payload_don = {
            "name": "Legacy Donor",
            "amount": 500,
            "transactionId": "TXN-LEGACY-01",
        }
        res_don = self.client.post('/api/donations/create/', data=payload_don, format='json')
        self.assertEqual(res_don.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_don.data['success'])

        # Contact send
        payload_cnt = {
            "name": "Legacy Contact",
            "email": "legacy_cnt@example.com",
            "message": "Testing legacy contact endpoint route.",
        }
        res_cnt = self.client.post('/api/contacts/send/', data=payload_cnt, format='json')
        self.assertEqual(res_cnt.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_cnt.data['success'])

    def test_anonymous_get_list_denied_for_all_forms(self):
        """Anonymous users are denied access to GET / list on all private endpoints"""
        self.assertEqual(self.client.get('/api/aarti-bookings/').status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.get('/api/memberships/').status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.get('/api/donations/').status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.get('/api/contacts/').status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_admin_get_list_allowed_for_all_forms(self):
        """Staff/admin users can list all public form submission records"""
        self.client.force_authenticate(user=self.admin_user)
        self.assertEqual(self.client.get('/api/aarti-bookings/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/memberships/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/donations/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/contacts/').status_code, status.HTTP_200_OK)


class WhatsAppNotificationSuiteTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_aarti_booking_whatsapp_admin_message_content(self):
        """Verify Aarti booking WhatsApp admin message structure and recipient"""
        booking = AartiBooking.objects.create(
            devotee_name="Rohit Sharma",
            email="rohit@example.com",
            phone="9876543210",
            city="Surat",
            booking_date="2026-09-14",
            aarti_type="morning",
            number_of_devotees=3,
            status="confirmed",
        )
        with patch('core.whatsapp.send_whatsapp_message') as mock_send:
            notify_admin_and_customer_on_booking(booking)
            self.assertTrue(mock_send.called)
            admin_recipient, admin_msg = mock_send.call_args_list[0][0]
            self.assertEqual(admin_recipient, '9662279799')
            self.assertIn("NEW AARTI BOOKING", admin_msg.upper())
            self.assertIn("Name: Rohit Sharma", admin_msg)
            self.assertIn("Mobile: 9876543210", admin_msg)
            self.assertIn("Email: rohit@example.com", admin_msg)
            self.assertIn("City: Surat", admin_msg)
            self.assertIn("Members: 3", admin_msg)

    def test_membership_whatsapp_admin_message_content(self):
        """Verify Membership registration WhatsApp admin message structure and recipient"""
        membership = Membership.objects.create(
            full_name="Pooja Patel",
            email="pooja.patel@example.com",
            phone="9876543211",
            city="Surat",
            membership_tier="silver",
            status="active",
        )
        with patch('core.whatsapp.send_whatsapp_message') as mock_send:
            notify_admin_and_customer_on_membership(membership)
            self.assertTrue(mock_send.called)
            admin_recipient, admin_msg = mock_send.call_args_list[0][0]
            self.assertEqual(admin_recipient, '9662279799')
            self.assertIn("NEW MEMBERSHIP REGISTRATION", admin_msg.upper())
            self.assertIn("Member Name: Pooja Patel", admin_msg)
            self.assertIn("Mobile Number: 9876543211", admin_msg)
            self.assertIn("Email: pooja.patel@example.com", admin_msg)
            self.assertIn("City/Address: Surat", admin_msg)
            self.assertIn("Membership Type: Silver Bhakta", admin_msg)
            self.assertIn("Number of Members: 1", admin_msg)
            self.assertIn("Payment Status:", admin_msg)

    def test_donation_whatsapp_admin_message_content(self):
        """Verify Donation WhatsApp admin message structure and recipient"""
        donation = Donation.objects.create(
            donor_name="Hitesh Mehta",
            email="hitesh@example.com",
            phone="9876543212",
            amount=5100,
            transaction_id="TXN-WA-TEST-01",
            status="pending",
        )
        with patch('core.whatsapp.send_whatsapp_message') as mock_send:
            notify_admin_on_donation(donation)
            self.assertTrue(mock_send.called)
            admin_recipient, admin_msg = mock_send.call_args_list[0][0]
            self.assertIn("🙏 New Donation Submitted", admin_msg)
            self.assertIn("Name: Hitesh Mehta", admin_msg)
            self.assertIn("Mobile: 9876543212", admin_msg)
            self.assertIn("Email: hitesh@example.com", admin_msg)
            self.assertIn("Amount: ₹5100", admin_msg)
            self.assertIn("Payment Method: GPay / UPI", admin_msg)
            self.assertIn("Status: Pending Verification", admin_msg)
            self.assertIn("Please verify the payment in the GPay account.", admin_msg)

    def test_contact_whatsapp_admin_message_content(self):
        """Verify Contact inquiry WhatsApp admin message structure and recipient"""
        contact = Contact.objects.create(
            name="Suresh Verma",
            email="suresh@example.com",
            phone="9876543213",
            subject="Prasad Timings Inquiry",
            message="Please let us know the Mahaprasad timings for Sunday.",
            status="new",
        )
        with patch('core.whatsapp.send_whatsapp_message') as mock_send:
            notify_admin_on_contact(contact)
            self.assertTrue(mock_send.called)
            admin_recipient, admin_msg = mock_send.call_args_list[0][0]
            self.assertEqual(admin_recipient, '9662279799')
            self.assertIn("📩 New Contact Enquiry", admin_msg)
            self.assertIn("Name: Suresh Verma", admin_msg)
            self.assertIn("Mobile: 9876543213", admin_msg)
            self.assertIn("Email: suresh@example.com", admin_msg)
            self.assertIn("Subject: Prasad Timings Inquiry", admin_msg)
            self.assertIn("Message: Please let us know the Mahaprasad timings for Sunday.", admin_msg)

    def test_all_form_api_posts_trigger_whatsapp_and_persist_db(self):
        """API submissions on all 4 public forms trigger WhatsApp notifications and save in DB"""
        with patch('core.whatsapp.send_whatsapp_message') as mock_send:
            # 1. Aarti Booking POST
            res_aarti = self.client.post('/api/aarti-bookings/', data={
                "name": "WA Aarti User",
                "mobile": "9876543201",
                "email": "wa_aarti@example.com",
                "city": "Surat",
                "date": "2026-09-16",
                "slot": "Morning Aarti",
                "members": 2,
            }, format='json')
            self.assertEqual(res_aarti.status_code, status.HTTP_201_CREATED)
            self.assertTrue(AartiBooking.objects.filter(email="wa_aarti@example.com").exists())

            # 2. Membership POST
            res_mem = self.client.post('/api/memberships/', data={
                "name": "WA Member User",
                "mobile": "9876543202",
                "email": "wa_mem@example.com",
                "city": "Surat",
            }, format='json')
            self.assertEqual(res_mem.status_code, status.HTTP_201_CREATED)
            self.assertTrue(Membership.objects.filter(email="wa_mem@example.com").exists())

            # 3. Donation POST
            res_don = self.client.post('/api/donations/', data={
                "name": "WA Donor User",
                "mobile": "9876543203",
                "email": "wa_don@example.com",
                "amount": 2100,
                "transactionId": "TXN-WA-POST-01",
            }, format='json')
            self.assertEqual(res_don.status_code, status.HTTP_201_CREATED)
            self.assertTrue(Donation.objects.filter(transaction_id="TXN-WA-POST-01").exists())

            # 4. Contact POST
            res_cnt = self.client.post('/api/contacts/', data={
                "name": "WA Contact User",
                "mobile": "9876543204",
                "email": "wa_cnt@example.com",
                "subject": "Darshan Question",
                "message": "Testing whatsapp trigger on contact submission.",
            }, format='json')
            self.assertEqual(res_cnt.status_code, status.HTTP_201_CREATED)
            self.assertTrue(Contact.objects.filter(email="wa_cnt@example.com").exists())

            # Verify mock was called for all forms
            self.assertGreaterEqual(mock_send.call_count, 4)

    def test_whatsapp_failure_does_not_break_api_submissions(self):
        """Even when WhatsApp sending throws an unexpected exception, all forms still save and return 201"""
        with patch('core.whatsapp.send_whatsapp_message', side_effect=Exception("Network Timeout")):
            # 1. Aarti Booking
            res1 = self.client.post('/api/aarti-bookings/', data={
                "name": "Err Aarti Devotee",
                "mobile": "9876543205",
                "email": "err_aarti@example.com",
                "date": "2026-09-17",
                "slot": "Night Aarti",
                "members": 1,
            }, format='json')
            self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
            self.assertTrue(AartiBooking.objects.filter(email="err_aarti@example.com").exists())

            # 2. Membership
            res2 = self.client.post('/api/memberships/', data={
                "name": "Err Member Devotee",
                "mobile": "9876543206",
                "email": "err_mem@example.com",
            }, format='json')
            self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
            self.assertTrue(Membership.objects.filter(email="err_mem@example.com").exists())

            # 3. Donation
            res3 = self.client.post('/api/donations/', data={
                "name": "Err Donor Devotee",
                "amount": 1100,
                "transactionId": "TXN-ERR-WA-01",
                "phone": "9876543207",
                "email": "err_don@example.com",
            }, format='json')
            self.assertEqual(res3.status_code, status.HTTP_201_CREATED)
            self.assertTrue(Donation.objects.filter(transaction_id="TXN-ERR-WA-01").exists())

            # 4. Contact
            res4 = self.client.post('/api/contacts/', data={
                "name": "Err Contact Devotee",
                "email": "err_cnt@example.com",
                "phone": "9876543208",
                "subject": "Darshan Info",
                "message": "Testing resilient form save despite whatsapp error.",
            }, format='json')
            self.assertEqual(res4.status_code, status.HTTP_201_CREATED)
            self.assertTrue(Contact.objects.filter(email="err_cnt@example.com").exists())


class EventAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin_events',
            email='admin_events@example.com',
            password='testpassword123'
        )
        # Create the 4 initial events in exact order
        self.event1 = Event.objects.create(
            order=1,
            day='Day 01 | Bhadrapada Chaturthi',
            title='Pran Pratishtha (Divine Invocation)',
            description='Welcome the Lord with traditional Dhol Tasha drums.',
            time='08:30 AM - 11:30 AM',
            location='Main Temple Hall',
            is_active=True
        )
        self.event2 = Event.objects.create(
            order=2,
            day='Day 05 | Bhadrapada Ashtami',
            title='Maha Chhappan Bhog Offering',
            description='A glorious visual offering of 56 varieties of handcrafted Modaks.',
            time='12:30 PM onwards',
            location='Prasad Mandap',
            is_active=True
        )
        self.event3 = Event.objects.create(
            order=3,
            day='Day 08 | Bhadrapada Ekadashi',
            title='Divine Maha Aarti & Jagran',
            description='A spectacular evening filled with hundreds of brass lamps.',
            time='07:00 PM - 11:00 PM',
            location='Sanctuary Courtyard',
            is_active=True
        )
        self.event4 = Event.objects.create(
            order=4,
            day='Day 10 | Anant Chaturdashi',
            title='Visarjan (Divine Immersion)',
            description='The emotional send-off procession under saffron colors.',
            time='09:00 AM onwards',
            location='Sacred Water Ghats',
            is_active=True
        )

    def test_public_can_list_all_4_initial_events_in_exact_order(self):
        """Public endpoint returns all 4 events sorted by order 1, 2, 3, 4"""
        res = self.client.get('/api/events/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        events = res.data['data']
        self.assertEqual(len(events), 4)
        self.assertEqual(events[0]['order'], 1)
        self.assertEqual(events[0]['title'], 'Pran Pratishtha (Divine Invocation)')
        self.assertEqual(events[1]['order'], 2)
        self.assertEqual(events[1]['title'], 'Maha Chhappan Bhog Offering')
        self.assertEqual(events[2]['order'], 3)
        self.assertEqual(events[2]['title'], 'Divine Maha Aarti & Jagran')
        self.assertEqual(events[3]['order'], 4)
        self.assertEqual(events[3]['title'], 'Visarjan (Divine Immersion)')

    def test_adding_future_events_preserves_automatic_alternation_order(self):
        """Adding 5th and 6th events automatically places them in sorted order for zig-zag alternation"""
        # Create 5th event
        res5 = self.client.post('/api/events/', data={
            "title": "5th Mega Cultural Evening",
            "day": "Day 06 | Cultural Gala",
            "description": "Grand classical dance & music tribute to Lord Ganesha.",
            "time": "06:00 PM - 09:00 PM",
            "location": "Open Amphitheatre",
            "order": 5,
            "is_active": True,
        }, format='json')
        self.assertEqual(res5.status_code, status.HTTP_201_CREATED)

        # Create 6th event
        res6 = self.client.post('/api/events/', data={
            "title": "6th Annakshetra Grand Feast",
            "day": "Day 09 | Maha Bhandara",
            "description": "Serving 50,000 devotees with sanctified prasadam.",
            "time": "11:00 AM - 04:00 PM",
            "location": "Bhandara Complex",
            "order": 6,
            "is_active": True,
        }, format='json')
        self.assertEqual(res6.status_code, status.HTTP_201_CREATED)

        # Verify sorted listing
        res = self.client.get('/api/events/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        events = res.data['data']
        self.assertEqual(len(events), 6)
        # Check alternating pattern expectations:
        # idx 0 (1st) -> LEFT
        # idx 1 (2nd) -> RIGHT
        # idx 2 (3rd) -> LEFT
        # idx 3 (4th) -> RIGHT
        # idx 4 (5th) -> LEFT
        # idx 5 (6th) -> RIGHT
        orders = [e['order'] for e in events]
        self.assertEqual(orders, [1, 2, 3, 4, 5, 6])
        self.assertEqual(events[4]['title'], "5th Mega Cultural Evening")
        self.assertEqual(events[5]['title'], "6th Annakshetra Grand Feast")


class WhatsAppWebhookAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.verify_token = "test_meta_webhook_secret_2026"

    def test_webhook_verification_get_success(self):
        """GET /api/whatsapp/webhook verification returns hub.challenge with HTTP 200 when tokens match"""
        with patch.dict('os.environ', {'WHATSAPP_VERIFY_TOKEN': self.verify_token}):
            url = f'/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token={self.verify_token}&hub.challenge=1158201444'
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.content.decode('utf-8'), '1158201444')
            self.assertEqual(response['Content-Type'], 'text/plain')

    def test_webhook_verification_get_token_mismatch_returns_403(self):
        """GET /api/whatsapp/webhook returns 403 Forbidden when verify token does not match"""
        with patch.dict('os.environ', {'WHATSAPP_VERIFY_TOKEN': self.verify_token}):
            url = '/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=1158201444'
            response = self.client.get(url)
            self.assertEqual(response.status_code, 403)
            self.assertIn("mismatch", response.content.decode('utf-8'))

    def test_webhook_verification_get_missing_params_returns_400(self):
        """GET /api/whatsapp/webhook returns 400 Bad Request when query params are missing"""
        response = self.client.get('/api/whatsapp/webhook')
        self.assertEqual(response.status_code, 400)

    def test_webhook_post_incoming_message_returns_200(self):
        """POST /api/whatsapp/webhook receives message payload and returns 200 OK EVENT_RECEIVED"""
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "WABA_123456",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "919662279799",
                            "phone_number_id": "123456789"
                        },
                        "contacts": [{
                            "profile": {"name": "Devotee Ramesh"},
                            "wa_id": "919876543210"
                        }],
                        "messages": [{
                            "from": "919876543210",
                            "id": "wamid.HBgLM...",
                            "timestamp": "1724740000",
                            "text": {"body": "Ganpati Bappa Morya! What are the Aarti timings?"},
                            "type": "text"
                        }]
                    },
                    "field": "messages"
                }]
            }]
        }
        response = self.client.post('/api/whatsapp/webhook', data=payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode('utf-8'), 'EVENT_RECEIVED')

    def test_webhook_post_status_receipt_returns_200(self):
        """POST /api/whatsapp/webhook receives delivery receipt payload and returns 200 OK"""
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "WABA_123456",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "phone_number_id": "123456789"
                        },
                        "statuses": [{
                            "id": "wamid.HBgLM...",
                            "status": "delivered",
                            "timestamp": "1724740010",
                            "recipient_id": "919876543210"
                        }]
                    },
                    "field": "messages"
                }]
            }]
        }
        response = self.client.post('/api/whatsapp/webhook/', data=payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode('utf-8'), 'EVENT_RECEIVED')

    def test_webhook_signature_verification_when_configured(self):
        """POST with WHATSAPP_APP_SECRET validates X-Hub-Signature-256 HMAC"""
        import hmac
        import hashlib
        app_secret = "my_secret_meta_key"
        payload_dict = {"object": "whatsapp_business_account", "entry": []}
        payload_bytes = json.dumps(payload_dict).encode('utf-8')
        signature = hmac.new(app_secret.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()

        with patch.dict('os.environ', {'WHATSAPP_APP_SECRET': app_secret}):
            # Valid signature
            res_valid = self.client.post(
                '/api/whatsapp/webhook/',
                data=payload_bytes,
                content_type='application/json',
                HTTP_X_HUB_SIGNATURE_256=f"sha256={signature}"
            )
            self.assertEqual(res_valid.status_code, 200)

            # Invalid signature
            res_invalid = self.client.post(
                '/api/whatsapp/webhook/',
                data=payload_bytes,
                content_type='application/json',
                HTTP_X_HUB_SIGNATURE_256="sha256=invalid_hex_signature"
            )
            self.assertEqual(res_invalid.status_code, 403)


class InstagramFeedAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        from django.core.cache import cache
        cache.clear()

    def test_unconfigured_instagram_feed_returns_fallback(self):
        """When token is empty, feed returns graceful fallback items with unconfigured flag."""
        with patch.dict('os.environ', {'INSTAGRAM_ACCESS_TOKEN': ''}):
            response = self.client.get('/api/instagram/feed/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data['success'])
            self.assertFalse(response.data['configured'])
            self.assertEqual(response.data['status'], 'unconfigured')
            self.assertGreater(len(response.data['data']), 0)
            self.assertIn('caption', response.data['data'][0])

    def test_live_instagram_feed_mocked_meta_api(self):
        """When token is set, mock Meta Graph API response and check parsed structure."""
        mock_meta_response = {
            "data": [
                {
                    "id": "17890123456789012",
                    "caption": "🚩 Live Aarti Darshan at Surat Cha Gaurinandan!",
                    "media_type": "VIDEO",
                    "media_url": "https://video.cdninstagram.com/reel1.mp4",
                    "thumbnail_url": "https://scontent.cdninstagram.com/thumb1.jpg",
                    "permalink": "https://www.instagram.com/reel/C-XYZ123/",
                    "timestamp": "2026-08-27T10:00:00+0000",
                    "username": "suratchagaurinandan",
                },
                {
                    "id": "17890123456789013",
                    "caption": "✨ Swarna Shringaar Darshan of Lord Ganesha",
                    "media_type": "IMAGE",
                    "media_url": "https://scontent.cdninstagram.com/photo2.jpg",
                    "permalink": "https://www.instagram.com/p/C-ABC456/",
                    "timestamp": "2026-08-26T15:30:00+0000",
                    "username": "suratchagaurinandan",
                }
            ],
            "paging": {
                "cursors": {"after": "QVFIUk5j..."}
            }
        }

        with patch.dict('os.environ', {
            'INSTAGRAM_ACCESS_TOKEN': 'EAAG123fake_access_token',
            'INSTAGRAM_APP_SECRET': 'fake_app_secret_12345'
        }):
            from django.core.cache import cache
            cache.clear()
            
            with patch('urllib.request.urlopen') as mock_urlopen:
                mock_cm = mock_urlopen.return_value.__enter__.return_value
                mock_cm.read.return_value = json.dumps(mock_meta_response).encode('utf-8')

                response = self.client.get('/api/instagram/feed/?limit=2&refresh=true')
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertTrue(response.data['success'])
                self.assertEqual(response.data['status'], 'live')
                self.assertTrue(response.data['configured'])
                self.assertEqual(len(response.data['data']), 2)

                post_1 = response.data['data'][0]
                self.assertEqual(post_1['id'], "17890123456789012")
                self.assertTrue(post_1['is_reel'])
                self.assertEqual(post_1['formatted_date'], "27 Aug 2026")

                post_2 = response.data['data'][1]
                self.assertFalse(post_2['is_reel'])
                self.assertEqual(post_2['formatted_date'], "26 Aug 2026")

    def test_instagram_appsecret_proof_calculation(self):
        """Validates HMAC-SHA256 calculation for Meta appsecret_proof."""
        from .instagram import compute_appsecret_proof
        import hmac
        import hashlib

        token = "test_token_abc"
        secret = "test_secret_xyz"
        expected = hmac.new(secret.encode('utf-8'), token.encode('utf-8'), hashlib.sha256).hexdigest()
        self.assertEqual(compute_appsecret_proof(token, secret), expected)
        self.assertEqual(compute_appsecret_proof("", secret), "")
        self.assertEqual(compute_appsecret_proof(token, ""), "")

    def test_instagram_meta_api_error_handling(self):
        """When Meta API throws HTTP error (e.g. invalid token), returns error status with fallback gracefully."""
        import urllib.error
        from io import BytesIO

        with patch.dict('os.environ', {'INSTAGRAM_ACCESS_TOKEN': 'expired_token'}):
            from django.core.cache import cache
            cache.clear()

            error_body = json.dumps({
                "error": {
                    "message": "Invalid OAuth access token - Cannot parse access token",
                    "type": "OAuthException",
                    "code": 190
                }
            }).encode('utf-8')

            http_err = urllib.error.HTTPError(
                url="https://graph.instagram.com/me/media",
                code=400,
                msg="Bad Request",
                hdrs={},
                fp=BytesIO(error_body)
            )

            with patch('urllib.request.urlopen', side_effect=http_err):
                response = self.client.get('/api/instagram/feed/?refresh=true')
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertFalse(response.data['success'])
                self.assertEqual(response.data['status'], 'error')
                self.assertIn('Invalid OAuth', response.data['message'])
                # Fallback items provided so site does not break
                self.assertGreater(len(response.data['data']), 0)

    def test_instagram_status_endpoint(self):
        """Tests the status / diagnostic endpoint."""
        response = self.client.get('/api/instagram/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('status', response.data)
        self.assertIn('configured', response.data['status'])
        self.assertIn('has_access_token', response.data['status'])
        self.assertIn('profile_url', response.data['status'])

    def test_instagram_token_refresh_admin_only(self):
        """Only authenticated admin/staff users can invoke the token refresh endpoint."""
        # Anonymous user -> 401 or 403
        anon_res = self.client.post('/api/instagram/refresh-token/')
        self.assertIn(anon_res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Staff user
        admin_user = User.objects.create_superuser('ig_admin', 'admin@example.com', 'AdminPass123!')
        self.client.force_authenticate(user=admin_user)

        with patch.dict('os.environ', {'INSTAGRAM_ACCESS_TOKEN': ''}):
            res = self.client.post('/api/instagram/refresh-token/')
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertFalse(res.data['success'])






