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
router.register(r'members', MembershipViewSet, basename='member')
router.register(r'contacts', ContactViewSet, basename='contact')

# Include router URLs in app's urlpatterns
urlpatterns = [
    # Legacy alias routes for backwards compatibility
    path('aarti/slots', AartiBookingViewSet.as_view({'get': 'availability'}), name='legacy-aarti-slots'),
    path('aarti/slots/', AartiBookingViewSet.as_view({'get': 'availability'}), name='legacy-aarti-slots-slash'),
    path('aarti/book', AartiBookingViewSet.as_view({'post': 'create'}), name='legacy-aarti-book'),
    path('aarti/book/', AartiBookingViewSet.as_view({'post': 'create'}), name='legacy-aarti-book-slash'),
    path('members/register', MembershipViewSet.as_view({'post': 'create'}), name='legacy-member-register'),
    path('members/register/', MembershipViewSet.as_view({'post': 'create'}), name='legacy-member-register-slash'),
    path('membership/register', MembershipViewSet.as_view({'post': 'create'}), name='legacy-membership-register'),
    path('membership/register/', MembershipViewSet.as_view({'post': 'create'}), name='legacy-membership-register-slash'),
    path('', include(router.urls)),
]
