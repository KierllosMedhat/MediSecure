import { Routes, Route, Navigate } from "react-router-dom";
import { ROLES, STAFF_ROLES, ALL_ROLES } from "./features/auth/roles";

/* ---- Layouts ---- */
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

/* ---- Auth Pages (Abanob) ---- */
import LoginPage from "./features/auth/pages/LoginPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";

/* ---- Landing Page (Abanob) ---- */
import LandingPage from "./pages/LandingPage";

/* ---- Patient Pages (Abanob) ---- */
import PatientDashboard from "./features/patients/pages/PatientDashboard";
import PatientProfile from "./features/patients/pages/PatientProfile";

/* ---- Records Pages (Fadi) ---- */
import RecordsList from "./features/records/pages/RecordsList";
import RecordDetail from "./features/records/pages/RecordDetail";
import UploadRecord from "./features/records/pages/UploadRecord";

/* ---- Consent Pages (Abdullah) ---- */
import ConsentManagement from "./features/consent/pages/ConsentManagement";

/* ---- Payments Pages (Abdullah) ---- */
import PaymentsPage from "./features/payments/pages/PaymentsPage";
import PaymentReceipt from "./features/payments/pages/PaymentReceipt";

/* ---- Staff / Admin Pages (Kyrillos) ---- */
import StaffDashboard from "./features/staff/pages/StaffDashboard";
import StaffList from "./features/staff/pages/StaffList";
import StaffForm from "./features/staff/pages/StaffForm";

/* ---- Appointments (Kyrillos) ---- */
import AppointmentsList from "./features/appointments/pages/AppointmentsList";
import CreateAppointment from "./features/appointments/pages/CreateAppointment";

/* ---- Notifications (Kyrillos) ---- */
import NotificationsPage from "./features/notifications/pages/NotificationsPage";

/* ---- Audit Logs (Kyrillos) ---- */
import AuditLogsPage from "./features/audit/pages/AuditLogsPage";

/* ---- Route Guards (Abanob) ---- */
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import PublicRoute from "./features/auth/components/PublicRoute";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* ========== Landing Page (public) ========== */}
      <Route path="/" element={<LandingPage />} />

      {/* ========== Auth Routes (public, redirects if logged in) ========== */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* ========== Patient Routes (PATIENT only) ========== */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/patients/profile" element={<PatientProfile />} />
        </Route>
      </Route>

      {/* ========== Shared Routes (all authenticated users) ========== */}
      <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
        <Route element={<DashboardLayout />}>
          {/* Records */}
          <Route path="/patients/:id/records" element={<RecordsList />} />
          <Route
            path="/patients/:id/records/:recordId"
            element={<RecordDetail />}
          />
          <Route path="/patients/:id/records/upload" element={<UploadRecord />} />

          {/* Consent */}
          <Route
            path="/patients/:id/consents"
            element={<ConsentManagement />}
          />

          {/* Payments */}
          <Route path="/payments" element={<PaymentsPage />} />
          <Route
            path="/payments/receipt/:paymentId"
            element={<PaymentReceipt />}
          />

          {/* Appointments */}
          <Route path="/appointments" element={<AppointmentsList />} />
          <Route path="/appointments/new" element={<CreateAppointment />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* ========== Staff Routes (DOCTOR, NURSE, BILLING_STAFF, ADMIN) ========== */}
      <Route element={<ProtectedRoute allowedRoles={STAFF_ROLES} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/list" element={<StaffList />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* ========== Admin-Only Routes ========== */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/staff/new" element={<StaffForm />} />
          <Route path="/staff/:id/edit" element={<StaffForm />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
