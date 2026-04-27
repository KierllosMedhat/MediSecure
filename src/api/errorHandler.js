/**
 * Map backend error codes to user-friendly messages.
 * Owner: Kyrillos (Shared UI)
 */

const ERROR_MESSAGES = {
  400: 'Bad request. Please check your input and try again.',
  401: 'Session expired. Please log in again.',
  402: 'Payment required. Please complete your outstanding balance.',
  403: 'Access denied. You do not have permission to view this resource.',
  404: 'The requested resource was not found.',
  409: 'Conflict. This action conflicts with the current state.',
  422: 'Validation error. Please review the form fields.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Internal server error. Please try again later.',
};

/**
 * Parse an Axios error into a user-friendly object.
 */
export function parseApiError(error) {
  if (!error.response) {
    return {
      status: 0,
      message: 'Network error. Please check your internet connection.',
      details: null,
    };
  }

  const { status, data } = error.response;
  return {
    status,
    message: data?.message || ERROR_MESSAGES[status] || 'An unexpected error occurred.',
    details: data?.errors || null,
  };
}

export default ERROR_MESSAGES;
