# 🛡️ MediSecure — Django Backend

Django REST Framework API backend for the MediSecure healthcare platform.

---

## 📁 Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
│
├── medisecure/                  # Project package
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── core/                        # Shared utilities
│   ├── pagination.py            # StandardPagination
│   └── permissions.py           # Role-based permission classes
│
├── accounts/      ← Abanob      # Auth & User management
├── patients/      ← Abanob      # Patient profiles & dashboard
├── records/       ← Fadi        # Medical records & documents
├── hospitals/     ← Fadi        # Hospital management
├── consent/       ← Abdullah    # PDPL consent management
├── payments/      ← Abdullah    # Payments & billing
├── staff/         ← Kyrillos    # Staff CRUD & dashboard
├── appointments/  ← Kyrillos    # Appointment scheduling
├── notifications/ ← Kyrillos    # Notification center
└── audit/         ← Kyrillos    # Audit logging
```

Each app follows the same structure:
```
<app>/
├── __init__.py
├── apps.py
├── models.py        # Django models (ERD entities)
├── serializers.py   # DRF serializers with validation
├── views.py         # API views (GenericAPIView subclasses)
├── urls.py          # URL routing
└── admin.py         # Django admin registration
```

---

## 👥 Team TODO Summary

### Abanob — `accounts/` + `patients/`
| File | TODOs |
|---|---|
| `accounts/serializers.py` | UserRegistrationSerializer, LoginSerializer, OTP flow, ChangePassword |
| `accounts/views.py` | RegisterView, LoginView, LogoutView, ProfileView, full password reset flow |
| `accounts/admin.py` | UserAdmin customization |
| `patients/serializers.py` | PatientSerializer (National ID validation), DashboardSerializer |
| `patients/views.py` | PatientProfileView (get_or_create), ListVew, DetailView, DashboardView |
| `patients/admin.py` | PatientAdmin customization |
| `core/permissions.py` | All role-based permission classes (IsAdmin, IsDoctor, etc.) |

### Fadi — `records/` + `hospitals/`
| File | TODOs |
|---|---|
| `records/serializers.py` | DocumentSerializer (file validation), RecordListSerializer, RecordDetailSerializer |
| `records/views.py` | CRUD views, DocumentUploadView (multipart), DocumentDownloadView (FileResponse/S3) |
| `records/admin.py` | MedicalRecordAdmin + DocumentAdmin |
| `hospitals/serializers.py` | HospitalSerializer (staff_count) |
| `hospitals/views.py` | HospitalListCreateView, HospitalDetailView (soft-delete) |
| `hospitals/admin.py` | HospitalAdmin customization |
| `medisecure/settings.py` | Uncomment S3/Azure storage config |

### Abdullah — `consent/` + `payments/`
| File | TODOs |
|---|---|
| `consent/serializers.py` | ConsentSerializer (PDPL validation), GrantSerializer, RevokeSerializer |
| `consent/views.py` | ListVew (role-based), GrantView, RevokeView, ConsentCheckView |
| `consent/admin.py` | ConsentAdmin customization |
| `payments/serializers.py` | PaymentSerializer, InitiateSerializer, FawryWebhookSerializer, ReceiptSerializer |
| `payments/views.py` | ListVew, InitiateView (multi-gateway), FawryWebhookView (signature verify), CardWebhookView, ReceiptView, RefundView |
| `payments/admin.py` | PaymentAdmin customization |

### Kyrillos — `staff/` + `appointments/` + `notifications/` + `audit/`
| File | TODOs |
|---|---|
| `staff/serializers.py` | StaffListSerializer, StaffDetailSerializer, StaffCreateSerializer (User+Staff transaction), DashboardSerializer |
| `staff/views.py` | ListView, CreateView, DetailView (soft-delete), DashboardView |
| `staff/admin.py` | StaffAdmin customization |
| `appointments/serializers.py` | AppointmentSerializer (conflict detection), StatusSerializer (transition rules) |
| `appointments/views.py` | ListCreateView, DetailView (soft-cancel), StatusView, AvailableSlotsView |
| `appointments/admin.py` | AppointmentAdmin customization |
| `notifications/serializers.py` | NotificationSerializer, NotificationCreateSerializer (multi-channel dispatch) |
| `notifications/views.py` | ListView, DetailView (auto-read), MarkAsReadView, UnreadCountView, DeleteView |
| `notifications/admin.py` | NotificationAdmin customization |
| `audit/utils.py` | `log_action()` — the shared helper ALL apps use |
| `audit/serializers.py` | AuditLogSerializer (read-only) |
| `audit/views.py` | ListView (rich filtering), DetailView, StatsView, ExportView (CSV) |
| `audit/admin.py` | AuditLogAdmin (immutable — no add/delete) |
| `medisecure/settings.py` | Add AuditLogMiddleware to MIDDLEWARE |

---

## 🚀 Setup Instructions

### 1. Create virtual environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
copy .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 4. Create PostgreSQL database
```sql
CREATE DATABASE medisecure_db;
```

### 5. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create superuser
```bash
python manage.py createsuperuser
```

### 7. Start development server
```bash
python manage.py runserver
```

API is available at: `http://localhost:8000/api/v1/`  
Admin panel: `http://localhost:8000/admin/`

---

## 🛣️ API Endpoint Reference

| Method | Endpoint | Owner | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register/` | Abanob | Register new user |
| POST | `/api/v1/auth/login/` | Abanob | Login → JWT tokens |
| POST | `/api/v1/auth/logout/` | Abanob | Blacklist refresh token |
| POST | `/api/v1/auth/token/refresh/` | Abanob | Refresh access token |
| GET/PUT | `/api/v1/auth/profile/` | Abanob | View/update profile |
| POST | `/api/v1/auth/password-reset/` | Abanob | Request OTP |
| POST | `/api/v1/auth/verify-otp/` | Abanob | Verify OTP |
| POST | `/api/v1/auth/password-reset/confirm/` | Abanob | Set new password |
| POST | `/api/v1/auth/change-password/` | Abanob | Change password |
| GET | `/api/v1/patients/` | Abanob | List all patients |
| GET/PUT | `/api/v1/patients/profile/` | Abanob | Patient profile |
| GET | `/api/v1/patients/dashboard/` | Abanob | Patient dashboard stats |
| GET | `/api/v1/patients/<id>/` | Abanob | Patient detail |
| GET/POST | `/api/v1/records/` | Fadi | List/create records |
| GET/PUT/DELETE | `/api/v1/records/<id>/` | Fadi | Record detail |
| POST | `/api/v1/records/<id>/documents/` | Fadi | Upload document |
| GET | `/api/v1/records/documents/<id>/download/` | Fadi | Download document |
| DELETE | `/api/v1/records/documents/<id>/` | Fadi | Delete document |
| GET | `/api/v1/records/recent-uploads/` | Fadi | Recent uploads widget |
| GET/POST | `/api/v1/hospitals/` | Fadi | List/create hospitals |
| GET/PUT/DELETE | `/api/v1/hospitals/<id>/` | Fadi | Hospital detail |
| GET | `/api/v1/consents/list/` | Abdullah | List consents |
| POST | `/api/v1/consents/` | Abdullah | Grant consent |
| GET | `/api/v1/consents/check/` | Abdullah | Check consent exists |
| GET | `/api/v1/consents/<id>/` | Abdullah | Consent detail |
| POST | `/api/v1/consents/<id>/revoke/` | Abdullah | Revoke consent |
| POST | `/api/v1/payments/` | Abdullah | Initiate payment |
| GET | `/api/v1/payments/list/` | Abdullah | Payment history |
| GET | `/api/v1/payments/<id>/` | Abdullah | Payment detail |
| GET | `/api/v1/payments/<id>/receipt/` | Abdullah | Payment receipt |
| POST | `/api/v1/payments/<id>/refund/` | Abdullah | Refund payment |
| POST | `/api/v1/payments/webhooks/fawry/` | Abdullah | Fawry webhook |
| POST | `/api/v1/payments/webhooks/card/` | Abdullah | Card webhook |
| GET | `/api/v1/staff/` | Kyrillos | List staff |
| POST | `/api/v1/staff/create/` | Kyrillos | Create staff member |
| GET | `/api/v1/staff/dashboard/` | Kyrillos | Staff dashboard stats |
| GET/PUT/DELETE | `/api/v1/staff/<id>/` | Kyrillos | Staff detail |
| GET/POST | `/api/v1/appointments/` | Kyrillos | List/create appointments |
| GET | `/api/v1/appointments/available-slots/` | Kyrillos | Available time slots |
| GET/PUT/DELETE | `/api/v1/appointments/<id>/` | Kyrillos | Appointment detail |
| PATCH | `/api/v1/appointments/<id>/status/` | Kyrillos | Update status |
| GET | `/api/v1/notifications/` | Kyrillos | List notifications |
| POST | `/api/v1/notifications/mark-read/` | Kyrillos | Mark as read (bulk) |
| GET | `/api/v1/notifications/unread-count/` | Kyrillos | Unread badge count |
| GET | `/api/v1/notifications/<id>/` | Kyrillos | Notification detail |
| DELETE | `/api/v1/notifications/<id>/delete/` | Kyrillos | Delete notification |
| GET | `/api/v1/audit-logs/` | Kyrillos | List audit logs |
| GET | `/api/v1/audit-logs/stats/` | Kyrillos | Audit statistics |
| GET | `/api/v1/audit-logs/export/` | Kyrillos | Export CSV |
| GET | `/api/v1/audit-logs/<id>/` | Kyrillos | Audit log detail |

---

## 🔐 Authentication

All protected endpoints require a JWT Bearer token:

```
Authorization: Bearer <access_token>
```

Refresh tokens are rotated on each use. Access tokens expire in 30 minutes.
