from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Custom SessionAuthentication that skips CSRF validation.
    Allows public form submissions via REST API from browsers without requiring CSRF tokens,
    while still recognizing authenticated sessions for staff/admin users.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF check for API endpoints
