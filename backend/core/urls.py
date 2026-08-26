from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GalleryViewSet,
    AartiBookingViewSet,
    DonationViewSet,
    MembershipViewSet,
    ContactViewSet,
    EventViewSet,
)

# Initialize DRF DefaultRouter
router = DefaultRouter()

# Register all ViewSets with distinct prefixes and basenames
router.register(r'gallery', GalleryViewSet, basename='gallery')
router.register(r'aarti-bookings', AartiBookingViewSet, basename='aartibooking')
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'donation', DonationViewSet, basename='donation-singular')
router.register(r'memberships', MembershipViewSet, basename='membership')
router.register(r'members', MembershipViewSet, basename='member')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'contact', ContactViewSet, basename='contact-singular')
router.register(r'events', EventViewSet, basename='event')
router.register(r'event', EventViewSet, basename='event-singular')
router.register(r'schedule', EventViewSet, basename='schedule')

# Include router URLs in app's urlpatterns
urlpatterns = [
    # Availability aliases
    path('aarti-bookings/availability', AartiBookingViewSet.as_view({'get': 'availability'}), name='aarti-availability-noslash'),
    path('aarti/slots', AartiBookingViewSet.as_view({'get': 'availability'}), name='legacy-aarti-slots'),
    path('aarti/slots/', AartiBookingViewSet.as_view({'get': 'availability'}), name='legacy-aarti-slots-slash'),
    
    # Aarti booking aliases
    path('aarti/book', AartiBookingViewSet.as_view({'post': 'create'}), name='legacy-aarti-book'),
    path('aarti/book/', AartiBookingViewSet.as_view({'post': 'create'}), name='legacy-aarti-book-slash'),
    path('aarti-booking', AartiBookingViewSet.as_view({'post': 'create'}), name='legacy-aarti-booking-singular'),
    path('aarti-booking/', AartiBookingViewSet.as_view({'post': 'create'}), name='legacy-aarti-booking-singular-slash'),
    
    # Membership aliases
    path('members/register', MembershipViewSet.as_view({'post': 'create'}), name='legacy-member-register'),
    path('members/register/', MembershipViewSet.as_view({'post': 'create'}), name='legacy-member-register-slash'),
    path('membership/register', MembershipViewSet.as_view({'post': 'create'}), name='legacy-membership-register'),
    path('membership/register/', MembershipViewSet.as_view({'post': 'create'}), name='legacy-membership-register-slash'),
    
    # Donation aliases
    path('donations/create', DonationViewSet.as_view({'post': 'create'}), name='legacy-donation-create'),
    path('donations/create/', DonationViewSet.as_view({'post': 'create'}), name='legacy-donation-create-slash'),
    path('donation/create', DonationViewSet.as_view({'post': 'create'}), name='legacy-donation-singular-create'),
    path('donation/create/', DonationViewSet.as_view({'post': 'create'}), name='legacy-donation-singular-create-slash'),
    
    # Contact aliases
    path('contacts/send', ContactViewSet.as_view({'post': 'create'}), name='legacy-contact-send'),
    path('contacts/send/', ContactViewSet.as_view({'post': 'create'}), name='legacy-contact-send-slash'),
    path('contact/send', ContactViewSet.as_view({'post': 'create'}), name='legacy-contact-singular-send'),
    path('contact/send/', ContactViewSet.as_view({'post': 'create'}), name='legacy-contact-singular-send-slash'),
    
    path('', include(router.urls)),
]
