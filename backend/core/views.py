from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .models import Gallery, AartiBooking, Donation, Membership, Contact
from .serializers import (
    GallerySerializer,
    AartiBookingSerializer,
    DonationSerializer,
    MembershipSerializer,
    ContactSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CreateOnlyOrAdminPermission(permissions.BasePermission):
    """
    Custom Permission:
    - Allows anyone (including unauthenticated devotees) to create a new submission (POST).
    - Requires Admin / Staff credentials for list (GET), retrieve, update, and delete actions.
    """
    def has_permission(self, request, view):
        if view.action == 'create':
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
    ViewSet for booking Aarti slots.
    Allow public POST for booking, admin staff for managing.
    """
    queryset = AartiBooking.objects.all()
    serializer_class = AartiBookingSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [CreateOnlyOrAdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['devotee_name', 'email', 'phone', 'notes']
    ordering_fields = ['booking_date', 'created_at']
    ordering = ['-booking_date']


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


class MembershipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Bhakta Membership registration.
    Allow public POST for registering, admin staff for managing.
    """
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [CreateOnlyOrAdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'email', 'phone']
    ordering_fields = ['created_at', 'full_name']
    ordering = ['-created_at']


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
