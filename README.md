# 🛡️ MediSecure

**Secure Health Records Management System — PDPL Compliant, Patient-First**

MediSecure is a full-stack healthcare platform built with a **React** frontend and **Django REST API** backend. It provides unified health record management, PDPL-compliant consent controls, multi-gateway payment processing, and role-based access for patients, doctors, nurses, billing staff, and administrators.

---

## 📑 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Team & Module Ownership](#team--module-ownership)
4. [Database Entities (ERD)](#database-entities-erd)
5. [Folder Structure](#folder-structure)
6. [Getting Started](#getting-started)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
7. [Features & Services](#features--services)
   - [🔐 Authentication & User Management](#-authentication--user-management)
   - [🧑‍⚕️ Patient Profile & Dashboard](#-patient-profile--dashboard)
   - [📋 Medical Records & Documents](#-medical-records--documents)
   - [🤝 Consent Management (PDPL)](#-consent-management-pdpl)
   - [💳 Payments & Billing](#-payments--billing)
   - [👨‍💼 Staff Management](#-staff-management)
   - [📅 Appointments](#-appointments)
   - [🔔 Notifications](#-notifications)
   - [📊 Audit Logs](#-audit-logs)
8. [API Endpoint Reference](#api-endpoint-reference)
9. [Route Map](#route-map)
10. [Manual Testing Guide](#manual-testing-guide)

---

## 🏗️ Architecture Overview

```
Actors                     Frontend                  Backend                    External Services
───────────               ──────────               ──────────                 ───────────────────
Patient  ──┐                                        ┌── PostgreSQL Database
Doctor   ──┤              React (Vite)    ◄─JSON─►  Django REST API  ──┤── Fawry Payment Gateway
Nurse    ──┼── HTTPS ──►  React Router              (Python)           ├── International Payment (Visa/MC)
Billing  ──┤              Axios                                        ├── Email Service (SMTP)
Admin    ──┘                                                           ├── SMS Service (OTP)
                                                                       └── Cloud Storage (S3/Azure Blob)
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7 |
| **HTTP Client** | Axios (with JWT interceptor + auto-refresh) |
| **Icons** | React Icons (Ionicons 5) |
| **Styling** | Vanilla CSS with CSS Custom Properties (design tokens) |
| **Backend** | Django, Django REST Framework (Python) |
| **Database** | PostgreSQL (SQLite for dev with `USE_SQLITE=True`) |
| **Auth** | JWT (SimpleJWT) — access tokens expire in 30 min, refresh tokens in 7 days |
| **External** | Fawry, Visa/Mastercard, SMTP, SMS, AWS S3 / Azure Blob |

---

## 👥 Team & Module Ownership

| Team Member | Role | Modules | Key Directories |
|---|---|---|---|
| **Abanob** | Auth & Patient Core | Login, Password Reset, JWT, Patient Profile & Dashboard, Route Guards | `features/auth/`, `features/patients/` |
| **Fadi** | Medical Records & Documents | Records List, Record Detail, Document Upload/Download, Recent Uploads Widget | `features/records/` |
| **Abdullah** | Consent & Payments | PDPL Consent Management, Fawry/Card Payments, Payment History & Receipts | `features/consent/`, `features/payments/` |
| **Kyrillos** | Staff, Admin & Shared UI | Staff CRUD, Appointments, Notifications, Audit Logs, Shared Components, Layouts | `features/staff/`, `features/appointments/`, `features/notifications/`, `features/audit/`, `components/`, `layouts/` |

---

## 🗄️ Database Entities (ERD)

| Entity | Primary Key | Key Fields |
|---|---|---|
| **Hospital** | Hospital_Id | Name, Address, Email, Phone, Subscription |
| **User** | User_Id | Email, Password_Hash, First_Name, Middle_Name, Last_Name, Phone_Number, Role |
| **Patient** | Patient_Id | User_Id (FK), National_Id, Date_Of_Birth, Blood_Type, Emergency_Contact, Address |
| **Staff** | Staff_Id | User_Id (FK), Hospital_Id (FK), Department, License_no, Address |
| **MedicalRecord** | Record_Id | Patient_Id (FK), Created_by/Staff_Id (FK), Record_type, Title, Description |
| **Document** | Document_Id | Record_Id (FK), file_name, file_path, file_type, file_size, Uploaded_by/User_Id (FK) |
| **Consent** | Consent_Id | Patient_Id (FK), Staff_Id (FK), Purpose, Is_Active, granted_at, revoked_at |
| **Payment** | Payment_Id | Patient_Id (FK), Amount, Currency, Payment_Type, Gateway_Type, Status, Paid_at, Receipt_URL |
| **Appointment** | Appointment_Id | Patient_Id (FK), Staff_Id (FK), Scheduled_at, Duration_Min, Status, Type, Location, Notes |
| **Notification** | Notification_Id | User_Id (FK), Type, Subject, Content, Sent_at, Delivered_at, Read_at |
| **Audit_Log** | Audit_Id | User_Id (FK), Action, Entity_Type, Entity_Id, Timestamp, Details, IP_Address |

**User Roles:** `PATIENT` · `DOCTOR` · `NURSE` · `BILLING_STAFF` · `ADMIN`

---

## 📁 Folder Structure

```
MediSecure/
├── backend/                          # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── integration_test.py           # End-to-end integration test script
│   ├── medisecure/                   # Django project settings
│   ├── core/                         # Shared utilities (pagination, permissions)
│   ├── accounts/     ← Abanob        # Auth & User management
│   ├── patients/     ← Abanob        # Patient profiles & dashboard
│   ├── records/      ← Fadi          # Medical records & documents
│   ├── hospitals/    ← Fadi          # Hospital management
│   ├── consent/      ← Abdullah      # PDPL consent management
│   ├── payments/     ← Abdullah      # Payments & billing
│   ├── staff/        ← Kyrillos      # Staff CRUD & dashboard
│   ├── appointments/ ← Kyrillos      # Appointment scheduling
│   ├── notifications/← Kyrillos      # Notification center
│   └── audit/        ← Kyrillos      # Audit logging
│
└── src/                              # React frontend
    ├── main.jsx                      # Entry point (BrowserRouter + AuthProvider)
    ├── App.jsx                       # Route definitions by module
    ├── index.css                     # Global design system (CSS custom properties)
    ├── api/                          # Shared API layer
    │   ├── apiClient.js              # Axios + JWT interceptors + auto-refresh
    │   ├── errorHandler.js           # Error code mapping (401, 403, 422, etc.)
    │   └── services/                 # One service per ERD entity
    │       ├── authService.js
    │       ├── patientService.js
    │       ├── recordsService.js
    │       ├── consentService.js
    │       ├── paymentService.js
    │       ├── staffService.js
    │       ├── appointmentService.js
    │       ├── notificationService.js
    │       ├── auditService.js
    │       └── hospitalService.js
    ├── components/                   # Shared / reusable UI
    │   ├── ui/                       # Button, Input, Modal, DataTable, StatusBadge, Card
    │   └── layout/                   # Sidebar (role-adaptive), Header
    ├── layouts/                      # Page layouts
    │   ├── AuthLayout.jsx            # Split-screen for login/reset flows
    │   └── DashboardLayout.jsx       # Sidebar + Header + content area
    └── features/                     # Feature modules
        ├── auth/                     # Login, SignUp, ForgotPassword, ResetPassword
        ├── patients/                 # Patient profile & dashboard
        ├── records/                  # Medical records list, detail, upload
        ├── consent/                  # Consent management
        ├── payments/                 # Payments & receipts
        ├── staff/                    # Staff list, form, dashboard
        ├── appointments/             # Appointment scheduling
        ├── notifications/            # Notification center
        └── audit/                   # Audit logs (Admin only)
```

---

## 🚀 Getting Started

### Backend Setup

#### Prerequisites
- Python 3.10+
- PostgreSQL (or use SQLite for development by setting `USE_SQLITE=True`)

#### 1. Create virtual environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
```

#### 2. Install dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configure environment
```bash
copy .env.example .env
```

Edit `.env` with your settings. For quick local development:
```env
SECRET_KEY=any-random-secret-key-here
DEBUG=True
USE_SQLITE=True          # Use SQLite — no PostgreSQL needed for dev
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

#### 4. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### 5. Create superuser (Admin account)
```bash
python manage.py createsuperuser
```

#### 6. Start development server
```bash
python manage.py runserver
```

- **API Base URL:** `http://localhost:8000/api/v1/`
- **Django Admin Panel:** `http://localhost:8000/admin/`

---

### Frontend Setup

#### Prerequisites
- Node.js 18+
- npm 9+

#### 1. Install dependencies
```bash
cd MediSecure   # project root
npm install
```

#### 2. Configure environment
```bash
copy .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### 3. Start development server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

#### Production Build
```bash
npm run build
npm run preview
```

---

## ✨ Features & Services

---

### 🔐 Authentication & User Management

**Owner:** Abanob | **Backend:** `accounts/` | **Frontend:** `features/auth/`

#### Features
| Feature | Description |
|---|---|
| **User Registration** | New users can sign up with email, password, name, and role |
| **Login** | Email + password authentication returns JWT access & refresh tokens |
| **Logout** | Blacklists the refresh token server-side |
| **Token Auto-Refresh** | Axios interceptor silently refreshes expired access tokens using the refresh token |
| **Forgot Password (OTP Flow)** | Three-step: request OTP via email → verify OTP → set new password |
| **Change Password** | Authenticated users can change their current password |
| **View/Edit Profile** | Authenticated users can view and update their profile info |
| **Role-Based Access** | Five roles: `PATIENT`, `DOCTOR`, `NURSE`, `BILLING_STAFF`, `ADMIN` |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login → JWT tokens |
| POST | `/api/v1/auth/logout` | Blacklist refresh token |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET/PUT | `/api/v1/auth/profile` | View/update profile |
| POST | `/api/v1/auth/forgot-password` | Request password reset OTP |
| POST | `/api/v1/auth/verify-otp` | Verify OTP code |
| POST | `/api/v1/auth/reset-password` | Set new password with reset token |
| POST | `/api/v1/auth/change-password` | Change password (authenticated) |

---

### 🧑‍⚕️ Patient Profile & Dashboard

**Owner:** Abanob | **Backend:** `patients/` | **Frontend:** `features/patients/`

#### Features
| Feature | Description |
|---|---|
| **Patient Profile** | View and update patient-specific fields: National ID, blood type, DOB, emergency contact, address |
| **Auto-Create Profile** | Patient profile is automatically created on first GET if it doesn't exist |
| **Patient Dashboard** | Summary stats: upcoming appointments, recent records, active consents, unread notifications |
| **Patient List** | Admin/staff can list all patients |
| **Patient Detail** | Admin/staff can view a specific patient's full record |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/patients/` | List all patients (Admin/Staff) |
| GET/PUT | `/api/v1/patients/profile` | Patient own profile |
| GET | `/api/v1/patients/dashboard` | Dashboard stats |
| GET | `/api/v1/patients/<id>/` | Patient detail (Admin/Staff) |

---

### 📋 Medical Records & Documents

**Owner:** Fadi | **Backend:** `records/` | **Frontend:** `features/records/`

#### Features
| Feature | Description |
|---|---|
| **List Records** | Patients see their own records; staff see records with active consent |
| **Create Record** | Staff creates a new medical record for a patient |
| **Record Detail** | Full view of a record with all associated documents |
| **Edit/Delete Record** | Staff can update or delete records |
| **Upload Document** | Upload files (PDF, images, DICOM, etc.) attached to a medical record |
| **Download Document** | Securely download documents (served from local storage or S3/Azure) |
| **Delete Document** | Remove a specific document from a record |
| **Recent Uploads Widget** | Dashboard widget showing the most recently uploaded documents |
| **Hospital Management** | Admin can create, list, view, and soft-delete hospitals |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/v1/records/` | List/create medical records |
| GET/PUT/DELETE | `/api/v1/records/<id>/` | Record detail, update, delete |
| POST | `/api/v1/records/<id>/documents/` | Upload document to a record |
| GET | `/api/v1/records/documents/<id>/download/` | Download a document |
| DELETE | `/api/v1/records/documents/<id>/` | Delete a document |
| GET | `/api/v1/records/recent-uploads/` | Recent uploads widget |
| GET/POST | `/api/v1/hospitals/` | List/create hospitals |
| GET/PUT/DELETE | `/api/v1/hospitals/<id>/` | Hospital detail |

---

### 🤝 Consent Management (PDPL)

**Owner:** Abdullah | **Backend:** `consent/` | **Frontend:** `features/consent/`

#### Features
| Feature | Description |
|---|---|
| **Grant Consent** | Patient grants a specific staff member access to their records for a given purpose |
| **Revoke Consent** | Patient can revoke a previously granted consent at any time |
| **List Consents** | Patients see their own consents; staff see consents granted to them |
| **Consent Detail** | View full consent details including purpose, dates, and status |
| **Consent Check** | API to check if a specific patient-staff consent relationship exists (used before accessing records) |
| **PDPL Validation** | Enforces Saudi PDPL rules on consent purpose and active state |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/consents/list/` | List consents (role-filtered) |
| POST | `/api/v1/consents/` | Grant consent |
| GET | `/api/v1/consents/check/` | Check if consent exists |
| GET | `/api/v1/consents/<id>/` | Consent detail |
| POST | `/api/v1/consents/<id>/revoke/` | Revoke consent |

---

### 💳 Payments & Billing

**Owner:** Abdullah | **Backend:** `payments/` | **Frontend:** `features/payments/`

#### Features
| Feature | Description |
|---|---|
| **Initiate Payment** | Patient initiates a payment via Fawry or international card (Visa/Mastercard) |
| **Payment History** | List all past payments for the current patient |
| **Payment Detail** | View full payment info including gateway reference, status, and timestamps |
| **Payment Receipt** | Generate and download a receipt for a completed payment |
| **Refund Payment** | Admin/Billing staff can initiate a refund for a payment |
| **Fawry Webhook** | Receive and verify payment status callbacks from Fawry gateway |
| **Card Webhook** | Receive payment callbacks for international card payments |
| **Multi-Gateway Support** | Supports both Fawry (local Egypt) and international card gateways |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/payments/` | Initiate payment |
| GET | `/api/v1/payments/list/` | Payment history |
| GET | `/api/v1/payments/<id>/` | Payment detail |
| GET | `/api/v1/payments/<id>/receipt/` | Payment receipt |
| POST | `/api/v1/payments/<id>/refund/` | Refund payment |
| POST | `/api/v1/payments/webhooks/fawry/` | Fawry webhook handler |
| POST | `/api/v1/payments/webhooks/card/` | Card gateway webhook |

---

### 👨‍💼 Staff Management

**Owner:** Kyrillos | **Backend:** `staff/` | **Frontend:** `features/staff/`

#### Features
| Feature | Description |
|---|---|
| **Staff List** | Admin view of all staff members with filtering and search |
| **Create Staff** | Admin creates a new staff member (simultaneously creates User + Staff records in a transaction) |
| **Staff Detail** | View a staff member's full profile including hospital, department, and license |
| **Edit Staff** | Admin can update staff member information |
| **Soft Delete Staff** | Admin can deactivate a staff member without permanently deleting records |
| **Staff Dashboard** | Stats for doctors/nurses: today's appointments, patients seen, pending tasks |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/staff/` | List all staff |
| POST | `/api/v1/staff/` | Create staff member |
| GET | `/api/v1/staff/dashboard/` | Staff dashboard stats |
| GET/PUT/DELETE | `/api/v1/staff/<id>/` | Staff detail, update, soft-delete |

---

### 📅 Appointments

**Owner:** Kyrillos | **Backend:** `appointments/` | **Frontend:** `features/appointments/`

#### Features
| Feature | Description |
|---|---|
| **List Appointments** | Patients see their own; staff see appointments assigned to them |
| **Create Appointment** | Book an appointment between a patient and a staff member |
| **Appointment Detail** | View full appointment info |
| **Update Appointment** | Edit appointment details (time, type, notes, location) |
| **Status Management** | Transition status: `SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED` or `CANCELLED`/`NO_SHOW` |
| **Available Slots** | Query a staff member's available time slots for a given day |
| **Conflict Detection** | Prevents double-booking a staff member for overlapping time slots |
| **Appointment Types** | `IN_PERSON`, `TELEMEDICINE`, `FOLLOW_UP`, `EMERGENCY` |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/v1/appointments/` | List/create appointments |
| GET | `/api/v1/appointments/available-slots/` | Query available slots |
| GET/PUT/DELETE | `/api/v1/appointments/<id>/` | Appointment detail |
| PATCH | `/api/v1/appointments/<id>/status/` | Update appointment status |

---

### 🔔 Notifications

**Owner:** Kyrillos | **Backend:** `notifications/` | **Frontend:** `features/notifications/`

#### Features
| Feature | Description |
|---|---|
| **Notification List** | User's personal notification inbox |
| **Notification Detail** | View a single notification (auto-marks as read) |
| **Mark as Read** | Bulk mark multiple notifications as read |
| **Unread Count Badge** | Returns count of unread notifications for the header badge |
| **Delete Notification** | Remove a notification from the inbox |
| **Multi-Channel Dispatch** | Notifications can be sent via email, SMS, or in-app |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/notifications/` | List notifications |
| POST | `/api/v1/notifications/mark-read/` | Mark as read (bulk) |
| GET | `/api/v1/notifications/unread-count/` | Unread badge count |
| GET | `/api/v1/notifications/<id>/` | Notification detail (auto-read) |
| DELETE | `/api/v1/notifications/<id>/delete/` | Delete notification |

---

### 📊 Audit Logs

**Owner:** Kyrillos | **Backend:** `audit/` | **Frontend:** `features/audit/`

#### Features
| Feature | Description |
|---|---|
| **Immutable Audit Trail** | All create/update/delete/access actions are logged automatically |
| **Rich Filtering** | Filter logs by user, action type, entity type, date range, IP address |
| **Audit Statistics** | Summary stats: actions per day, top actors, most-accessed entities |
| **Export CSV** | Admin can export the full audit log as a CSV file |
| **Audit Detail** | View full details of a specific audit log entry |
| **Admin-Only Access** | Audit logs are read-only and accessible only to `ADMIN` role |

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/audit-logs/` | List audit logs (with filtering) |
| GET | `/api/v1/audit-logs/stats/` | Audit statistics |
| GET | `/api/v1/audit-logs/export/` | Export CSV |
| GET | `/api/v1/audit-logs/<id>/` | Audit log detail |

---

## 🛣️ Route Map

### Public Routes (no authentication required)

| Path | Page | Owner |
|---|---|---|
| `/auth/login` | Login | Abanob |
| `/auth/signup` | Sign Up | Abanob |
| `/auth/forgot-password` | Forgot Password (email → OTP) | Abanob |
| `/auth/reset-password` | Reset Password | Abanob |

### Protected Routes (authentication required)

| Path | Page | Role | Owner |
|---|---|---|---|
| `/dashboard` | Patient Dashboard | PATIENT | Abanob |
| `/patients/profile` | Patient Profile | PATIENT | Abanob |
| `/patients/:id/records` | Health Records List | All | Fadi |
| `/patients/:id/records/:recordId` | Record Detail | All | Fadi |
| `/records/upload` | Upload Record + Document | Staff | Fadi |
| `/patients/:id/consents` | Consent Management | PATIENT | Abdullah |
| `/payments` | Payments & Billing | PATIENT, BILLING_STAFF | Abdullah |
| `/payments/receipt/:paymentId` | Payment Receipt | PATIENT, BILLING_STAFF | Abdullah |
| `/staff/dashboard` | Staff Dashboard | DOCTOR, NURSE | Kyrillos |
| `/staff/list` | Staff List | ADMIN | Kyrillos |
| `/staff/new` | Create Staff | ADMIN | Kyrillos |
| `/staff/:id/edit` | Edit Staff | ADMIN | Kyrillos |
| `/appointments` | Appointments List | All | Kyrillos |
| `/appointments/new` | Create Appointment | All | Kyrillos |
| `/notifications` | Notification Center | All | Kyrillos |
| `/admin/audit-logs` | Audit Logs | ADMIN | Kyrillos |

---

## 🧪 Manual Testing Guide

This section explains how to manually test every feature. Start by setting up both the backend and frontend as described in [Getting Started](#getting-started).

> **Base URLs:**
> - Backend API: `http://localhost:8000/api/v1`
> - Frontend: `http://localhost:5173`
> - Django Admin: `http://localhost:8000/admin`

---

### 🔧 Prerequisites for Testing

1. Run the backend server: `python manage.py runserver`
2. Run the frontend: `npm run dev`
3. Use a REST client like [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/), or the built-in **Django Admin** for API testing.
4. Alternatively, use `curl` from the terminal.

---

### 1️⃣ Authentication Testing

#### Test: Register a New Patient
```http
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "email": "patient@test.com",
  "password": "Password123!",
  "password_confirm": "Password123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "PATIENT"
}
```
✅ **Expected:** `201 Created` with user data.

#### Test: Login
```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "patient@test.com",
  "password": "Password123!"
}
```
✅ **Expected:** `200 OK` with `access` and `refresh` tokens. Save the `access` token for subsequent requests.

#### Test: View Profile
```http
GET http://localhost:8000/api/v1/auth/profile
Authorization: Bearer <access_token>
```
✅ **Expected:** `200 OK` with user profile data.

#### Test: Forgot Password Flow
1. **Request OTP:**
   ```http
   POST http://localhost:8000/api/v1/auth/forgot-password
   Content-Type: application/json
   {"email": "patient@test.com"}
   ```
   ✅ Expected: `200 OK`. Check email (or Django console if `EMAIL_BACKEND = console`) for OTP.

2. **Verify OTP:**
   ```http
   POST http://localhost:8000/api/v1/auth/verify-otp
   Content-Type: application/json
   {"email": "patient@test.com", "otp": "123456"}
   ```
   ✅ Expected: `200 OK` with a `reset_token`.

3. **Reset Password:**
   ```http
   POST http://localhost:8000/api/v1/auth/reset-password
   Content-Type: application/json
   {"reset_token": "<token>", "new_password": "NewPass456!", "new_password_confirm": "NewPass456!"}
   ```
   ✅ Expected: `200 OK`.

#### Test: Logout
```http
POST http://localhost:8000/api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{"refresh": "<refresh_token>"}
```
✅ **Expected:** `205 Reset Content`. The refresh token is now blacklisted.

#### Test: UI Login Flow
1. Open `http://localhost:5173/auth/login`
2. Enter `patient@test.com` / `Password123!`
3. ✅ Should redirect to `/dashboard`
4. Try invalid credentials → ✅ Should show an error message

---

### 2️⃣ Patient Profile & Dashboard Testing

#### Test: Fetch Patient Profile (auto-creates on first access)
```http
GET http://localhost:8000/api/v1/patients/profile
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK` with patient profile. A Patient record is auto-created if it doesn't exist.

#### Test: Update Patient Profile
```http
PUT http://localhost:8000/api/v1/patients/profile
Authorization: Bearer <patient_access_token>
Content-Type: application/json

{
  "blood_type": "O+",
  "date_of_birth": "1990-05-15",
  "national_id": "1234567890",
  "address": "123 Main Street, Riyadh"
}
```
✅ **Expected:** `200 OK` with updated profile.

#### Test: Patient Dashboard Stats
```http
GET http://localhost:8000/api/v1/patients/dashboard
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK` with stats (upcoming appointments, record count, active consents, unread notifications).

#### Test: UI Dashboard
1. Login as a patient at `http://localhost:5173/auth/login`
2. Navigate to `http://localhost:5173/dashboard`
3. ✅ Should show dashboard cards with stats
4. Navigate to `http://localhost:5173/patients/profile`
5. Edit a field and save → ✅ Should update successfully

---

### 3️⃣ Medical Records & Documents Testing

> **Note:** You'll need a staff account. Register one with `role: "DOCTOR"` or use Django Admin.

#### Test: Create a Medical Record (as Staff)
```http
POST http://localhost:8000/api/v1/records/
Authorization: Bearer <doctor_access_token>
Content-Type: application/json

{
  "patient": <patient_id>,
  "record_type": "CONSULTATION",
  "title": "Initial Consultation",
  "description": "Patient presented with mild fever."
}
```
✅ **Expected:** `201 Created` with record ID.

#### Test: List Records (as Patient)
```http
GET http://localhost:8000/api/v1/records/
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK` with list of the patient's records.

#### Test: Upload Document
```http
POST http://localhost:8000/api/v1/records/<record_id>/documents/
Authorization: Bearer <doctor_access_token>
Content-Type: multipart/form-data

file: <select a PDF or image file>
```
✅ **Expected:** `201 Created` with document metadata.

#### Test: Download Document
```http
GET http://localhost:8000/api/v1/records/documents/<document_id>/download/
Authorization: Bearer <access_token>
```
✅ **Expected:** File download response.

#### Test: Recent Uploads Widget
```http
GET http://localhost:8000/api/v1/records/recent-uploads/
Authorization: Bearer <access_token>
```
✅ **Expected:** `200 OK` with the 5 most recent document uploads.

#### Test: UI Records Flow
1. Login as a doctor → Navigate to a patient's records page
2. ✅ Should see records list
3. Click a record → ✅ Should show record detail with attached documents
4. Use the upload form at `/records/upload` to upload a document

---

### 4️⃣ Consent Management Testing

#### Test: Grant Consent (as Patient)
```http
POST http://localhost:8000/api/v1/consents/
Authorization: Bearer <patient_access_token>
Content-Type: application/json

{
  "staff": <staff_id>,
  "purpose": "TREATMENT"
}
```
✅ **Expected:** `201 Created` with consent record.

#### Test: List Consents
```http
GET http://localhost:8000/api/v1/consents/list/
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK` with list of the patient's consents.

#### Test: Check Consent Exists
```http
GET http://localhost:8000/api/v1/consents/check/?patient=<patient_id>&staff=<staff_id>
Authorization: Bearer <doctor_access_token>
```
✅ **Expected:** `200 OK` with `{"exists": true/false}`.

#### Test: Revoke Consent
```http
POST http://localhost:8000/api/v1/consents/<consent_id>/revoke/
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK`. Consent `is_active` is now `false`.

#### Test: UI Consent Flow
1. Login as patient → Navigate to `/patients/<id>/consents`
2. ✅ Should see active and revoked consents
3. Click "Revoke" on an active consent → ✅ Should update status to revoked

---

### 5️⃣ Payments Testing

#### Test: Initiate Payment
```http
POST http://localhost:8000/api/v1/payments/
Authorization: Bearer <patient_access_token>
Content-Type: application/json

{
  "amount": "150.00",
  "currency": "EGP",
  "payment_type": "CONSULTATION_FEE",
  "gateway_type": "FAWRY"
}
```
✅ **Expected:** `201 Created` with payment record and gateway reference.

#### Test: Payment History
```http
GET http://localhost:8000/api/v1/payments/list/
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK` with list of payments.

#### Test: Payment Receipt
```http
GET http://localhost:8000/api/v1/payments/<payment_id>/receipt/
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK` with receipt data (or PDF download).

#### Test: UI Payments Flow
1. Login as patient → Navigate to `/payments`
2. ✅ Should see payment history table
3. Click "New Payment" → Fill form → Submit
4. Navigate to `/payments/receipt/<id>` → ✅ Should show receipt

---

### 6️⃣ Staff Management Testing

> **Note:** Requires an `ADMIN` account.

#### Test: Create Staff
```http
POST http://localhost:8000/api/v1/staff/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "Password123!",
  "first_name": "Dr. Sarah",
  "last_name": "Smith",
  "role": "DOCTOR",
  "hospital": 1,
  "department": "CARDIOLOGY",
  "license_no": "LIC-2024-001"
}
```
✅ **Expected:** `201 Created` with staff data. User + Staff created atomically.

#### Test: List Staff
```http
GET http://localhost:8000/api/v1/staff/
Authorization: Bearer <admin_access_token>
```
✅ **Expected:** `200 OK` with paginated staff list.

#### Test: Staff Dashboard Stats
```http
GET http://localhost:8000/api/v1/staff/dashboard/
Authorization: Bearer <doctor_access_token>
```
✅ **Expected:** `200 OK` with today's appointments, patients count, etc.

#### Test: Soft-Delete Staff
```http
DELETE http://localhost:8000/api/v1/staff/<id>/
Authorization: Bearer <admin_access_token>
```
✅ **Expected:** `204 No Content`. Staff member deactivated (not deleted from DB).

#### Test: UI Staff Flow
1. Login as Admin → Navigate to `/staff/list`
2. ✅ Should see staff table with search/filter
3. Click "New Staff" → `/staff/new` → Fill form → Submit
4. ✅ Should appear in staff list
5. Click "Edit" on a staff member → `/staff/<id>/edit` → Modify → Save

---

### 7️⃣ Appointments Testing

#### Test: Create Appointment
```http
POST http://localhost:8000/api/v1/appointments/
Authorization: Bearer <patient_access_token>
Content-Type: application/json

{
  "patient": <patient_id>,
  "staff": <staff_id>,
  "scheduled_at": "2026-07-01T10:00:00Z",
  "duration_min": 30,
  "appointment_type": "IN_PERSON",
  "location": "Clinic Room 3",
  "notes": "Routine checkup"
}
```
✅ **Expected:** `201 Created`. A notification is automatically sent to both patient and staff.

#### Test: List Appointments
```http
GET http://localhost:8000/api/v1/appointments/
Authorization: Bearer <patient_access_token>
```
✅ **Expected:** `200 OK` with appointments list.

#### Test: Check Available Slots
```http
GET http://localhost:8000/api/v1/appointments/available-slots/?staff=<staff_id>&date=2026-07-01
Authorization: Bearer <access_token>
```
✅ **Expected:** `200 OK` with list of available time slots.

#### Test: Update Appointment Status
```http
PATCH http://localhost:8000/api/v1/appointments/<id>/status/
Authorization: Bearer <doctor_access_token>
Content-Type: application/json

{"status": "CONFIRMED"}
```
✅ **Expected:** `200 OK` with updated status.

#### Test: Conflict Detection
Create two appointments for the same staff member at the same time:
```http
POST http://localhost:8000/api/v1/appointments/
...
{"scheduled_at": "2026-07-01T10:00:00Z", "staff": <same_staff_id>}
```
✅ **Expected:** `400 Bad Request` — "Staff member has a conflicting appointment."

#### Test: UI Appointments Flow
1. Navigate to `/appointments` → ✅ Should see appointments list
2. Click "New Appointment" → `/appointments/new`
3. Fill in patient, doctor, date/time → Submit
4. ✅ Should appear in list with status `SCHEDULED`

---

### 8️⃣ Notifications Testing

#### Test: List Notifications
```http
GET http://localhost:8000/api/v1/notifications/
Authorization: Bearer <access_token>
```
✅ **Expected:** `200 OK` with user's notifications.

#### Test: Get Unread Count
```http
GET http://localhost:8000/api/v1/notifications/unread-count/
Authorization: Bearer <access_token>
```
✅ **Expected:** `200 OK` — `{"unread_count": 3}`.

#### Test: Mark as Read (Bulk)
```http
POST http://localhost:8000/api/v1/notifications/mark-read/
Authorization: Bearer <access_token>
Content-Type: application/json

{"notification_ids": [1, 2, 3]}
```
✅ **Expected:** `200 OK`. Unread count drops to 0.

#### Test: Auto-Mark Read on Detail View
```http
GET http://localhost:8000/api/v1/notifications/<id>/
Authorization: Bearer <access_token>
```
✅ **Expected:** `200 OK`. After this request, the notification is marked as read.

#### Test: Delete Notification
```http
DELETE http://localhost:8000/api/v1/notifications/<id>/delete/
Authorization: Bearer <access_token>
```
✅ **Expected:** `204 No Content`.

#### Test: UI Notifications
1. Book an appointment → ✅ A notification should appear
2. Navigate to `/notifications` → ✅ Should see notification inbox
3. Click a notification → ✅ Should mark it as read
4. Check header badge → ✅ Count should decrease

---

### 9️⃣ Audit Logs Testing

> **Note:** Requires an `ADMIN` account.

#### Test: List Audit Logs
```http
GET http://localhost:8000/api/v1/audit-logs/
Authorization: Bearer <admin_access_token>
```
✅ **Expected:** `200 OK` with paginated audit log entries.

#### Test: Filter Audit Logs
```http
GET http://localhost:8000/api/v1/audit-logs/?action=CREATE&entity_type=Appointment
Authorization: Bearer <admin_access_token>
```
✅ **Expected:** `200 OK` — only appointment creation events.

#### Test: Audit Statistics
```http
GET http://localhost:8000/api/v1/audit-logs/stats/
Authorization: Bearer <admin_access_token>
```
✅ **Expected:** `200 OK` with stats like actions per day, top users, etc.

#### Test: Export CSV
```http
GET http://localhost:8000/api/v1/audit-logs/export/
Authorization: Bearer <admin_access_token>
```
✅ **Expected:** `200 OK` — triggers a CSV file download.

#### Test: Verify Audit Entry Created
1. Create any resource (e.g., an appointment)
2. Check audit logs → ✅ A `CREATE` entry should appear for the appointment

#### Test: UI Audit Logs (Admin only)
1. Login as Admin → Navigate to `/admin/audit-logs`
2. ✅ Should see full audit table with filters
3. ✅ Non-admin users should be redirected away (403/404)

---

### 🤖 Automated Integration Test

A full end-to-end integration test script is included in the backend:

```bash
# Ensure backend is running first
cd backend
venv\Scripts\activate
python manage.py runserver &

# In another terminal
python integration_test.py
```

This script automatically tests:
1. Admin registration & login
2. Patient registration, login & profile fetch
3. Staff (Doctor) creation
4. Appointment creation
5. Notification check
6. Audit log verification

✅ All steps should complete with `200`/`201` status codes and print `All integration tests passed successfully!`

---

### 🔐 Django Admin Panel Testing

For direct database inspection and testing without the frontend:

1. Open `http://localhost:8000/admin/`
2. Login with your superuser credentials
3. You can:
   - Create/edit/delete any model directly
   - Inspect audit log entries (read-only)
   - Manage user roles and permissions
   - View all appointments, consents, payments, etc.

---

## 🔐 Authentication Notes

All protected endpoints require a JWT Bearer token:

```
Authorization: Bearer <access_token>
```

- **Access tokens** expire in **30 minutes**
- **Refresh tokens** expire in **7 days** and are rotated on each use
- The frontend Axios interceptor automatically refreshes expired tokens using the refresh token stored in memory

---

## 🗄️ ERD — Database Entities

| Entity | Primary Key | Key Fields |
|---|---|---|
| **Hospital** | Hospital_Id | Name, Address, Email, Phone, Subscription |
| **User** | User_Id | Email, Password_Hash, First_Name, Middle_Name, Last_Name, Phone_Number, Role |
| **Patient** | Patient_Id | User_Id (FK), National_Id, Date_Of_Birth, Blood_Type, Emergency_Contact, Address |
| **Staff** | Staff_Id | User_Id (FK), Hospital_Id (FK), Department, License_no, Address |
| **MedicalRecord** | Record_Id | Patient_Id (FK), Created_by/Staff_Id (FK), Record_type, Title, Description |
| **Document** | Document_Id | Record_Id (FK), file_name, file_path, file_type, file_size, Uploaded_by/User_Id (FK) |
| **Consent** | Consent_Id | Patient_Id (FK), Staff_Id (FK), Purpose, Is_Active, granted_at, revoked_at |
| **Payment** | Payment_Id | Patient_Id (FK), Amount, Currency, Payment_Type, Gateway_Type, Status, Paid_at, Receipt_URL |
| **Appointment** | Appointment_Id | Patient_Id (FK), Staff_Id (FK), Scheduled_at, Duration_Min, Status, Type, Location, Notes |
| **Notification** | Notification_Id | User_Id (FK), Type, Subject, Content, Sent_at, Delivered_at, Read_at |
| **Audit_Log** | Audit_Id | User_Id (FK), Action, Entity_Type, Entity_Id, Timestamp, Details, IP_Address |
