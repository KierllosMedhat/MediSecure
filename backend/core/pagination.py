"""
Shared pagination classes for the MediSecure API.
Used by all apps via REST_FRAMEWORK settings.
"""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Default pagination: 20 items per page, max 100."""
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
