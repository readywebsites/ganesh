import json
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import AartiBooking
from .whatsapp import notify_admin_and_customer_on_booking, send_whatsapp_message


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
