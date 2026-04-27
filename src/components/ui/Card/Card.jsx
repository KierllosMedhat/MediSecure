/**
 * Card component for dashboard widgets
 * Owner: Kyrillos (Shared UI)
 */
import './Card.css';

export default function Card({ title, subtitle, children, className = '', actions, ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || actions) && (
        <div className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  );
}
