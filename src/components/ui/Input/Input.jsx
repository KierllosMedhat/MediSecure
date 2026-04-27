/**
 * Reusable Input component
 * Owner: Kyrillos (Shared UI)
 */
import './Input.css';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}) {
  return (
    <div className={`input-group ${fullWidth ? 'input-group--full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="input-group__label">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`input-group__field ${error ? 'input-group__field--error' : ''}`}
        {...props}
      />
      {error && <span className="input-group__error">{error}</span>}
      {helperText && !error && <span className="input-group__helper">{helperText}</span>}
    </div>
  );
}
