# 🛡️ MediSecure

**Secure Health Records Management System — PDPL Compliant, Patient-First**

MediSecure is a full-stack healthcare platform built with a **React** frontend and **Django REST API** backend. It provides unified health record management, PDPL-compliant consent controls, multi-gateway payment processing, and role-based access for patients, doctors, nurses, billing staff, and administrators.

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

## 👥 Team & Module Ownership

| Team Member | Role | Modules | Key Directories |
|---|---|---|---|
| **Abanob** | Auth & Patient Core | Login, Password Reset, JWT, Patient Profile & Dashboard, Route Guards | `features/auth/`, `features/patients/` |
| **Fadi** | Medical Records & Documents | Records List, Record Detail, Document Upload/Download, Recent Uploads Widget | `features/records/` |
| **Abdullah** | Consent & Payments | PDPL Consent Management, Fawry/Card Payments, Payment History & Receipts | `features/consent/`, `features/payments/` |
| **Kyrillos** | Staff, Admin & Shared UI | Staff CRUD, Appointments, Notifications, Audit Logs, Shared Components, Layouts | `features/staff/`, `features/appointments/`, `features/notifications/`, `features/audit/`, `components/`, `layouts/` |

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

**User Roles:** `PATIENT` · `DOCTOR` · `NURSE` · `BILLING_STAFF` · `ADMIN`

## 📁 Folder Structure

```
src/
├── main.jsx                          # Entry point (BrowserRouter + AuthProvider)
├── App.jsx                           # Route definitions by module
├── index.css                         # Global design system (CSS custom properties)
│
├── api/                              # Shared API layer
│   ├── apiClient.js                  # Axios + JWT interceptors + auto-refresh
│   ├── errorHandler.js               # Error code mapping (401, 403, 422, etc.)
│   └── services/                     # One service per ERD entity
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
│
├── components/                       # Shared / reusable
│   ├── ui/                           # Button, Input, Modal, DataTable, StatusBadge, Card
│   └── layout/                       # Sidebar (role-adaptive), Header
│
├── layouts/                          # Page layouts
│   ├── AuthLayout.jsx                # Split-screen for login/reset flows
│   └── DashboardLayout.jsx           # Sidebar + Header + content area
│
└── features/                         # Feature modules (one per team member)
    ├── auth/                         # Abanob
    ├── patients/                     # Abanob
    ├── records/                      # Fadi
    ├── consent/                      # Abdullah
    ├── payments/                     # Abdullah
    ├── staff/                        # Kyrillos
    ├── appointments/                 # Kyrillos
    ├── notifications/                # Kyrillos
    └── audit/                        # Kyrillos
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repo-url>
cd MediSecure
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` to set your backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## 🛣️ Route Map

### Public Routes (unauthenticated)

| Path | Page | Owner |
|---|---|---|
| `/auth/login` | Login | Abanob |
| `/auth/forgot-password` | Forgot Password (email → OTP) | Abanob |
| `/auth/reset-password` | Reset Password | Abanob |

### Protected Routes (authenticated)

| Path | Page | Owner |
|---|---|---|
| `/dashboard` | Patient Dashboard | Abanob |
| `/patients/profile` | Patient Profile | Abanob |
| `/patients/:id/records` | Health Records List | Fadi |
| `/patients/:id/records/:recordId` | Record Detail | Fadi |
| `/records/upload` | Upload Record + Document | Fadi |
| `/patients/:id/consents` | Consent Management | Abdullah |
| `/payments` | Payments & Billing | Abdullah |
| `/payments/receipt/:paymentId` | Payment Receipt | Abdullah |
| `/staff/dashboard` | Staff Dashboard | Kyrillos |
| `/staff/list` | Staff List (Admin) | Kyrillos |
| `/staff/new` | Create Staff (Admin) | Kyrillos |
| `/staff/:id/edit` | Edit Staff (Admin) | Kyrillos |
| `/appointments` | Appointments List | Kyrillos |
| `/appointments/new` | Create Appointment | Kyrillos |
| `/notifications` | Notification Center | Kyrillos |
| `/admin/audit-logs` | Audit Logs (Admin) | Kyrillos |

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7 |
| **HTTP Client** | Axios (with JWT interceptor + auto-refresh) |
| **Icons** | React Icons (Ionicons 5) |
| **Styling** | Vanilla CSS with CSS Custom Properties (design tokens) |
| **Backend** | Django, Django REST Framework (Python) |
| **Database** | PostgreSQL |
| **External** | Fawry, Visa/Mastercard, SMTP, SMS, AWS S3 / Azure Blob |
