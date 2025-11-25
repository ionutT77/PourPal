"""
Custom authentication class that doesn't enforce CSRF for session auth
"""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication without CSRF validation.
    Use this for API endpoints that need session auth but not CSRF.
    """
    def enforce_csrf(self, request):
        return  # Do not enforce CSRF
