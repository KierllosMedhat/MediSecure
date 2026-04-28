import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./features/auth/context/AuthContext";

/* ---- Layouts ---- */
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

/* ---- Auth Pages (Abanob) ---- */
import LoginPage from "./features/auth/pages/LoginPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";

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
      {/* ========== Public / Auth Routes ========== */}
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/payments/receipt/:paymentId" element={<PaymentReceipt />} />

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* ========== Protected Routes ========== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Patient Routes */}
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/patients/profile" element={<PatientProfile />} />

          {/* Records (Fadi) */}
          <Route path="/patients/:id/records" element={<RecordsList />} />
          <Route
            path="/patients/:id/records/:recordId"
            element={<RecordDetail />}
          />
          <Route path="/records/upload" element={<UploadRecord />} />

          {/* Consent (Abdullah) */}
          <Route
            path="/patients/:id/consents"
            element={<ConsentManagement />}
          />

          {/* Payments (Abdullah) */}

          {/* Staff / Admin (Kyrillos) */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/list" element={<StaffList />} />
          <Route path="/staff/new" element={<StaffForm />} />
          <Route path="/staff/:id/edit" element={<StaffForm />} />

          {/* Appointments (Kyrillos) */}
          <Route path="/appointments" element={<AppointmentsList />} />
          <Route path="/appointments/new" element={<CreateAppointment />} />

          {/* Notifications (Kyrillos) */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Audit Logs (Kyrillos — Admin only) */}
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}

export default App;
