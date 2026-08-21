import uuid
import logging
from datetime import datetime, date
from django.db import transaction, models
from django.http import Http404
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Gallery, AartiBooking, Donation, Membership, Contact
from .serializers import (
    GallerySerializer,
    AartiBookingSerializer,
    DonationSerializer,
    MembershipSerializer,
    ContactSerializer,
)
from .whatsapp import (
    notify_admin_and_customer_on_booking,
    notify_admin_and_customer_on_membership,
)

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CreateOnlyOrAdminPermission(permissions.BasePermission):
    """
    Custom Permission:
    - Allows anyone (including unauthenticated devotees) to create (POST) or check availability (GET).
    - Requires Admin / Staff credentials for list (GET), retrieve, update, and delete actions.
    """
    def has_permission(self, request, view):
        if view.action in ('create', 'availability'):
            return True
        return bool(request.user and request.user.is_staff)


class GalleryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing Gallery items.
    """
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'caption', 'category']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Non-staff users only see active gallery items by default
        if not (self.request.user and self.request.user.is_staff):
            queryset = queryset.filter(status='active')
        return queryset


class AartiBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for booking Aarti slots and checking date-specific capacity.
    - Public devotees can check availability (GET /api/aarti-bookings/availability/?date=YYYY-MM-DD)
    - Public devotees can book Aarti passes (POST /api/aarti-bookings/)
    - Admin / Staff can view, filter, update status, and manage records.
    """
    queryset = AartiBooking.objects.all()
    serializer_class = AartiBookingSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [CreateOnlyOrAdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['devotee_name', 'email', 'phone', 'city', 'notes']
    ordering_fields = ['booking_date', 'created_at', 'number_of_devotees']
    ordering = ['-booking_date', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        date_param = self.request.query_params.get('date')
        slot_param = self.request.query_params.get('slot')
        status_param = self.request.query_params.get('status')
        city_param = self.request.query_params.get('city')

        if date_param:
            queryset = queryset.filter(booking_date=date_param)
        if slot_param:
            if 'morning' in slot_param.lower():
                queryset = queryset.filter(aarti_type__in=['morning', 'mangala', 'rajbhog'])
            elif 'night' in slot_param.lower():
                queryset = queryset.filter(aarti_type__in=['night', 'sandhya', 'shej'])
            else:
                queryset = queryset.filter(aarti_type=slot_param)
        if status_param:
            queryset = queryset.filter(status__iexact=status_param)
        if city_param:
            queryset = queryset.filter(city__icontains=city_param)

        return queryset

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs.get(lookup_url_kwarg)
        if not lookup_val:
            return super().get_object()

        # Try standard UUID lookup
        try:
            val_uuid = uuid.UUID(str(lookup_val))
            return AartiBooking.objects.get(id=val_uuid)
        except (ValueError, AartiBooking.DoesNotExist):
            pass

        # Try lookup by booking_id string or partial UUID
        clean_val = str(lookup_val).strip()
        booking = AartiBooking.objects.filter(id__startswith=clean_val.replace('-', '')).first()
        if booking:
            return booking

        for b in AartiBooking.objects.all():
            if b.booking_id.lower() == clean_val.lower():
                return b

        raise Http404(f"Aarti booking '{lookup_val}' not found.")

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def availability(self, request):
        """
        GET /api/aarti-bookings/availability/?date=YYYY-MM-DD
        Calculates date-specific Morning & Night Aarti booking capacity.
        Max capacity per slot: 5 persons.
        """
        date_str = request.query_params.get('date', '').strip()
        if not date_str:
            date_str = '2026-09-14'

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            target_date = date.today()
            date_str = target_date.strftime('%Y-%m-%d')

        max_slot_capacity = 5

        # Active bookings for morning
        morning_booked = AartiBooking.objects.filter(
            booking_date=target_date,
            aarti_type__in=['morning', 'mangala', 'rajbhog'],
            status__in=['confirmed', 'pending']
        ).aggregate(total=models.Sum('number_of_devotees'))['total'] or 0

        # Active bookings for night
        night_booked = AartiBooking.objects.filter(
            booking_date=target_date,
            aarti_type__in=['night', 'sandhya', 'shej'],
            status__in=['confirmed', 'pending']
        ).aggregate(total=models.Sum('number_of_devotees'))['total'] or 0

        morning_remaining = max(0, max_slot_capacity - morning_booked)
        night_remaining = max(0, max_slot_capacity - night_booked)

        morning_is_full = morning_remaining <= 0
        night_is_full = night_remaining <= 0

        return Response({
            "success": True,
            "date": date_str,
            "morning": {
                "capacity": max_slot_capacity,
                "booked": morning_booked,
                "remaining": morning_remaining,
                "is_full": morning_is_full,
            },
            "night": {
                "capacity": max_slot_capacity,
                "booked": night_booked,
                "remaining": night_remaining,
                "is_full": night_is_full,
            },
            "slot": {
                "date": date_str,
                "bookingOpen": True,
                "morning": {
                    "slot": "Morning Aarti",
                    "time": "09:00 AM",
                    "capacity": max_slot_capacity,
                    "booked": morning_booked,
                    "remaining": morning_remaining,
                    "is_full": morning_is_full,
                    "isFull": morning_is_full,
                },
                "night": {
                    "slot": "Night Aarti",
                    "time": "08:00 PM",
                    "capacity": max_slot_capacity,
                    "booked": night_booked,
                    "remaining": night_remaining,
                    "is_full": night_is_full,
                    "isFull": night_is_full,
                },
            }
        })

    def create(self, request, *args, **kwargs):
        """
        POST /api/aarti-bookings/
        Atomic booking creation with capacity lock and WhatsApp notification.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Build clear, helpful error message
            error_message = "Validation failed."
            if 'non_field_errors' in serializer.errors:
                error_message = serializer.errors['non_field_errors'][0]
            elif 'aarti_type' in serializer.errors:
                error_message = str(serializer.errors['aarti_type'][0])
            elif 'number_of_devotees' in serializer.errors:
                error_message = str(serializer.errors['number_of_devotees'][0])
            elif 'phone' in serializer.errors:
                error_message = str(serializer.errors['phone'][0])
            elif 'booking_date' in serializer.errors:
                error_message = str(serializer.errors['booking_date'][0])
            else:
                for k, v in serializer.errors.items():
                    first_v = v[0] if isinstance(v, list) else v
                    error_message = f"{k}: {first_v}"
                    break

            return Response({
                "success": False,
                "message": error_message,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Atomic transaction to guarantee no race-condition overbooking
        try:
            with transaction.atomic():
                booking = serializer.save()
        except Exception as e:
            logger.error(f"Error saving Aarti Booking: {e}", exc_info=True)
            return Response({
                "success": False,
                "message": "A database error occurred while creating your booking. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Send WhatsApp notifications safely in background / try-except
        notify_admin_and_customer_on_booking(booking)

        headers = self.get_success_headers(serializer.data)
        return Response({
            "success": True,
            "message": "Aarti booking confirmed successfully.",
            "booking": serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)


class DonationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for processing donations.
    Allow public POST for donation, admin staff for managing.
    """
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [CreateOnlyOrAdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['donor_name', 'email', 'phone', 'transaction_id']
    ordering_fields = ['amount', 'created_at']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        """
        POST /api/donations/
        Public submission of donation / transfer record.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            error_message = "Validation failed."
            if 'non_field_errors' in serializer.errors:
                error_message = str(serializer.errors['non_field_errors'][0])
            elif 'transaction_id' in serializer.errors:
                error_message = str(serializer.errors['transaction_id'][0])
            elif 'amount' in serializer.errors:
                error_message = str(serializer.errors['amount'][0])
            elif 'phone' in serializer.errors:
                error_message = str(serializer.errors['phone'][0])
            elif 'email' in serializer.errors:
                error_message = str(serializer.errors['email'][0])
            elif 'donor_name' in serializer.errors:
                error_message = str(serializer.errors['donor_name'][0])
            else:
                for k, v in serializer.errors.items():
                    first_v = v[0] if isinstance(v, list) else v
                    error_message = f"{k}: {first_v}"
                    break

            return Response({
                "success": False,
                "message": error_message,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                donation = serializer.save()
        except Exception as e:
            logger.error(f"Error saving Donation: {e}", exc_info=True)
            return Response({
                "success": False,
                "message": "A database error occurred while recording donation. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        headers = self.get_success_headers(serializer.data)
        return Response({
            "success": True,
            "message": "Donation recorded successfully.",
            "data": serializer.data,
            "donation": serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_amount = Donation.objects.aggregate(total=models.Sum('amount'))['total'] or 0
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            res = self.get_paginated_response(serializer.data)
            res.data['success'] = True
            res.data['data'] = serializer.data
            res.data['totalAmount'] = float(total_amount)
            return res

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "donations": serializer.data,
            "totalAmount": float(total_amount)
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Donation deleted successfully."
        }, status=status.HTTP_200_OK)


class MembershipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Bhakta Membership registration.
    - Anyone can POST/create a membership
    - Only authenticated admin/staff can GET, LIST, UPDATE or DELETE memberships
    """
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [CreateOnlyOrAdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'email', 'phone', 'city', 'occupation', 'volunteer', 'address']
    ordering_fields = ['created_at', 'full_name', 'city']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        volunteer_param = self.request.query_params.get('volunteer')
        city_param = self.request.query_params.get('city')
        search_param = self.request.query_params.get('search')

        if status_param and status_param != 'All':
            queryset = queryset.filter(status__iexact=status_param)
        if volunteer_param and volunteer_param != 'All':
            queryset = queryset.filter(volunteer__icontains=volunteer_param)
        if city_param:
            queryset = queryset.filter(city__icontains=city_param)
        if search_param:
            queryset = queryset.filter(
                models.Q(full_name__icontains=search_param) |
                models.Q(email__icontains=search_param) |
                models.Q(phone__icontains=search_param) |
                models.Q(city__icontains=search_param) |
                models.Q(occupation__icontains=search_param) |
                models.Q(volunteer__icontains=search_param)
            )

        return queryset

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs.get(lookup_url_kwarg)
        if not lookup_val:
            return super().get_object()

        # Try standard UUID lookup
        try:
            val_uuid = uuid.UUID(str(lookup_val))
            return Membership.objects.get(id=val_uuid)
        except (ValueError, Membership.DoesNotExist):
            pass

        # Try lookup by membership_id string or partial UUID
        clean_val = str(lookup_val).strip()
        member = Membership.objects.filter(id__startswith=clean_val.replace('-', '')).first()
        if member:
            return member

        for m in Membership.objects.all():
            if m.membership_id.lower() == clean_val.lower():
                return m

        raise Http404(f"Membership '{lookup_val}' not found.")

    def create(self, request, *args, **kwargs):
        """
        POST /api/memberships/
        Public registration of Bhakta membership with WhatsApp notification.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            error_message = "Validation failed."
            if 'non_field_errors' in serializer.errors:
                error_message = str(serializer.errors['non_field_errors'][0])
            elif 'phone' in serializer.errors:
                error_message = str(serializer.errors['phone'][0])
            elif 'email' in serializer.errors:
                error_message = str(serializer.errors['email'][0])
            elif 'full_name' in serializer.errors:
                error_message = str(serializer.errors['full_name'][0])
            else:
                for k, v in serializer.errors.items():
                    first_v = v[0] if isinstance(v, list) else v
                    error_message = f"{k}: {first_v}"
                    break

            return Response({
                "success": False,
                "message": error_message,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                membership = serializer.save()
        except Exception as e:
            logger.error(f"Error saving Membership: {e}", exc_info=True)
            return Response({
                "success": False,
                "message": "A database error occurred while creating membership. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Send WhatsApp notifications safely in background / try-except
        try:
            notify_admin_and_customer_on_membership(membership)
        except Exception as e:
            logger.error(f"[WhatsApp] Notification error on membership: {e}", exc_info=True)

        headers = self.get_success_headers(serializer.data)
        return Response({
            "success": True,
            "message": "Membership submitted successfully.",
            "membershipId": membership.membership_id,
            "membership": serializer.data,
            "data": serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            res = self.get_paginated_response(serializer.data)
            res.data['success'] = True
            res.data['data'] = serializer.data
            return res

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "memberships": serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "Membership updated successfully.",
            "data": serializer.data,
            "membership": serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Membership deleted successfully."
        }, status=status.HTTP_200_OK)


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for submitting contact inquiries.
    Allow public POST for messages, admin staff for managing.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [CreateOnlyOrAdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        """
        POST /api/contacts/
        Public submission of contact inquiry message.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            error_message = "Validation failed."
            if 'non_field_errors' in serializer.errors:
                error_message = str(serializer.errors['non_field_errors'][0])
            elif 'message' in serializer.errors:
                error_message = str(serializer.errors['message'][0])
            elif 'subject' in serializer.errors:
                error_message = str(serializer.errors['subject'][0])
            elif 'name' in serializer.errors:
                error_message = str(serializer.errors['name'][0])
            elif 'email' in serializer.errors:
                error_message = str(serializer.errors['email'][0])
            else:
                for k, v in serializer.errors.items():
                    first_v = v[0] if isinstance(v, list) else v
                    error_message = f"{k}: {first_v}"
                    break

            return Response({
                "success": False,
                "message": error_message,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                contact = serializer.save()
        except Exception as e:
            logger.error(f"Error saving Contact inquiry: {e}", exc_info=True)
            return Response({
                "success": False,
                "message": "A database error occurred while sending your message. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        headers = self.get_success_headers(serializer.data)
        return Response({
            "success": True,
            "message": "Your message has been received successfully.",
            "data": serializer.data,
            "contact": serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            res = self.get_paginated_response(serializer.data)
            res.data['success'] = True
            res.data['data'] = serializer.data
            return res

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "contacts": serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "Contact updated successfully.",
            "data": serializer.data,
            "contact": serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Contact message deleted successfully."
        }, status=status.HTTP_200_OK)
