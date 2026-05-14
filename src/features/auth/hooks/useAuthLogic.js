/**
 * Auth Business Logic Hooks
 * Separates all auth-related business logic from UI components.
 *
 * Owner: Abanob
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import authApi from '../../../api/services/authService';
import { parseApiError } from '../../../api/errorHandler';
import { getDashboardPath } from '../roles';

/**
 * Generate a stable device_id for this browser session.
 * Persisted in sessionStorage since it's a device identifier, not a credential.
 */
function getDeviceId() {
  let deviceId = sessionStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    sessionStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

/* ============================================================
   useLoginLogic — handles login form state, validation, submit
   ============================================================ */
export function useLoginLogic() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }

      setIsSubmitting(true);
      try {
        const deviceId = getDeviceId();
        const data = await login(email, password, deviceId);

        /* Role-based redirect */
        const from = location.state?.from?.pathname;

        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate(getDashboardPath(data.user?.role), { replace: true });
        }
      } catch (err) {
        const parsed = parseApiError(err);
        setError(parsed.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, login, navigate, location.state]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleSubmit,
  };
}

/* ============================================================
   useSignUpLogic — handles sign up form state and submission
   ============================================================ */
export function useSignUpLogic() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [patientId, setPatientId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your first and last name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      if (!password.trim() || password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      setIsSubmitting(true);
      try {
        // TODO: Wire to actual signup API endpoint when backend is ready
        // const deviceId = getDeviceId();
        // await authApi.signup({ first_name: firstName, last_name: lastName, email, password, patient_id: patientId, device_id: deviceId });

        navigate('/auth/login', {
          state: { message: 'Account created successfully. Please log in.' },
          replace: true,
        });
      } catch (err) {
        const parsed = parseApiError(err);
        setError(parsed.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [firstName, lastName, email, password, navigate]
  );

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    patientId,
    setPatientId,
    error,
    isSubmitting,
    handleSubmit,
  };
}

/* ============================================================
   useForgotPasswordLogic — 2-step: email → OTP verification
   ============================================================ */
export function useForgotPasswordLogic() {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  /* Step 1: Send OTP to email */
  const handleSendOtp = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }

      setIsSubmitting(true);
      try {
        await authApi.forgotPassword(email);
        setSuccess('Verification code sent to your email.');
        setStep(2);
      } catch (err) {
        const parsed = parseApiError(err);
        setError(parsed.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email]
  );

  /* Step 2: Verify OTP */
  const handleVerifyOtp = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (!otp.trim()) {
        setError('Please enter the verification code.');
        return;
      }

      setIsSubmitting(true);
      try {
        await authApi.verifyOtp(email, otp);
        navigate('/auth/reset-password', {
          state: { email, otp },
          replace: true,
        });
      } catch (err) {
        const parsed = parseApiError(err);
        setError(parsed.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, otp, navigate]
  );

  return {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    error,
    success,
    isSubmitting,
    handleSendOtp,
    handleVerifyOtp,
  };
}

/* ============================================================
   useResetPasswordLogic — new password after OTP verification
   ============================================================ */
export function useResetPasswordLogic() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { email, otp } = location.state || {};
  const isValidLink = Boolean(email && otp);

  /* Auto-redirect to login after success */
  const redirectTimer = useRef(null);
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (!newPassword.trim()) {
        setError('Please enter a new password.');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        await authApi.resetPassword({ email, otp, new_password: newPassword });
        setSuccess('Password reset successfully! Redirecting to login…');
        redirectTimer.current = setTimeout(() => {
          navigate('/auth/login', {
            state: { message: 'Password reset successfully. Please log in.' },
            replace: true,
          });
        }, 2000);
      } catch (err) {
        const parsed = parseApiError(err);
        setError(parsed.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [newPassword, confirmPassword, email, otp, navigate]
  );

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    isSubmitting,
    isValidLink,
    handleSubmit,
  };
}
