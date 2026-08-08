from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GalleryViewSet,
    AartiBookingViewSet,
    DonationViewSet,
    MembershipViewSet,
    ContactViewSet,
)

# Initialize DRF DefaultRouter
router = DefaultRouter()

# Register all ViewSets with distinct prefixes and basenames
router.register(r'gallery', GalleryViewSet, basename='gallery')
router.register(r'aarti-bookings', AartiBookingViewSet, basename='aartibooking')
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'memberships', MembershipViewSet, basename='membership')
router.register(r'contacts', ContactViewSet, basename='contact')

# Include router URLs in app's urlpatterns
urlpatterns = [
    path('', include(router.urls)),
]
