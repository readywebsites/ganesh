from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GalleryViewSet,
    AartiBookingViewSet,
    DonationViewSet,
    MembershipViewSet,
    ContactViewSet,
    EventViewSet,
    InstagramFeedView,
    InstagramStatusView,
    InstagramRefreshTokenView,
    WhatsAppStatusView,
    WhatsAppTestAlertView,
)
from .whatsapp_webhook import WhatsAppWebhookView

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
    # WhatsApp Status & Healthcheck Endpoint
    path('whatsapp/status', WhatsAppStatusView.as_view(), name='whatsapp-status-noslash'),
    path('whatsapp/status/', WhatsAppStatusView.as_view(), name='whatsapp-status'),
    path('api/whatsapp/status', WhatsAppStatusView.as_view(), name='whatsapp-status-api-noslash'),
    path('api/whatsapp/status/', WhatsAppStatusView.as_view(), name='whatsapp-status-api'),

    # WhatsApp Test Alert Endpoint
    path('whatsapp/test', WhatsAppTestAlertView.as_view(), name='whatsapp-test-noslash'),
    path('whatsapp/test/', WhatsAppTestAlertView.as_view(), name='whatsapp-test'),
    path('api/whatsapp/test', WhatsAppTestAlertView.as_view(), name='whatsapp-test-api-noslash'),
    path('api/whatsapp/test/', WhatsAppTestAlertView.as_view(), name='whatsapp-test-api'),

    # WhatsApp Cloud API Webhook Endpoint (GET for Meta verification, POST for events)
    path('whatsapp/webhook', WhatsAppWebhookView.as_view(), name='whatsapp-webhook-noslash'),
    path('whatsapp/webhook/', WhatsAppWebhookView.as_view(), name='whatsapp-webhook'),
    path('api/whatsapp/webhook', WhatsAppWebhookView.as_view(), name='whatsapp-webhook-api-noslash'),
    path('api/whatsapp/webhook/', WhatsAppWebhookView.as_view(), name='whatsapp-webhook-api'),

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

    # Instagram Live Feed endpoints & aliases
    path('instagram/feed', InstagramFeedView.as_view(), name='instagram-feed-noslash'),
    path('instagram/feed/', InstagramFeedView.as_view(), name='instagram-feed'),
    path('instagram', InstagramFeedView.as_view(), name='instagram-root-noslash'),
    path('instagram/', InstagramFeedView.as_view(), name='instagram-root'),
    path('instagram/status', InstagramStatusView.as_view(), name='instagram-status-noslash'),
    path('instagram/status/', InstagramStatusView.as_view(), name='instagram-status'),
    path('instagram/refresh-token', InstagramRefreshTokenView.as_view(), name='instagram-refresh-token-noslash'),
    path('instagram/refresh-token/', InstagramRefreshTokenView.as_view(), name='instagram-refresh-token'),

    path('', include(router.urls)),
]
