"""
Payments URLs — Owner: Abdullah

Aligned to frontend paymentService.js call patterns.

Frontend calls:
  GET    /payments                    → PaymentListView  (getPaymentHistory)
  GET    /payments/balance            → PaymentBalanceView (getOutstandingBalance)
  POST   /payments/fawry              → FawryPaymentView  (payWithFawry)
  POST   /payments/card               → CardPaymentView   (payWithCard)
  GET    /payments/<id>/status        → PaymentStatusView (getPaymentStatus)
  GET    /payments/<id>/receipt       → PaymentReceiptView (getReceipt)

Internal (not called by frontend directly):
  POST   /payments/webhooks/fawry     → FawryWebhookView
  POST   /payments/webhooks/card      → CardWebhookView
  POST   /payments/<id>/refund        → PaymentRefundView
"""

from django.urls import path
from . import views

app_name = "payments"

urlpatterns = [
    # Frontend-facing payment endpoints
    path("", views.PaymentListView.as_view(), name="payment-list"),
    path("balance", views.PaymentBalanceView.as_view(), name="payment-balance"),
    path("fawry", views.FawryPaymentView.as_view(), name="payment-fawry"),
    path("card", views.CardPaymentView.as_view(), name="payment-card"),
    path("<int:pk>/status", views.PaymentStatusView.as_view(), name="payment-status"),
    path("<int:pk>/receipt", views.PaymentReceiptView.as_view(), name="payment-receipt"),
    path("<int:pk>/refund", views.PaymentRefundView.as_view(), name="payment-refund"),

    # Gateway webhooks
    path("webhooks/fawry", views.FawryWebhookView.as_view(), name="fawry-webhook"),
    path("webhooks/card", views.CardWebhookView.as_view(), name="card-webhook"),
]
