/**
 * Landing Page — Marketing page matching Figma design.
 * Sections: Navbar → Hero → Auth Forms → Core Features → Data Silos → Footer
 * Owner: Abanob
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoShieldCheckmark, IoDocumentText, IoCard, IoLockClosed, IoPeople, IoPulse } from 'react-icons/io5';
import { Button, Input } from '../components/ui';
import { useLoginLogic } from '../features/auth/hooks/useAuthLogic';
import heroImg from '../assets/hero-medical.png';
import doctorImg from '../assets/doctor-patient.png';
import './LandingPage.css';

const FEATURES = [
  {
    icon: <IoDocumentText />,
    color: 'var(--color-primary)',
    title: 'Unified Health Records',
    desc: 'Centralized cloud storage for all your medical documents with instant retrieval by authorized staff.',
  },
  {
    icon: <IoShieldCheckmark />,
    color: 'var(--color-success)',
    title: 'Role-Based Access',
    desc: 'Secure access control ensuring data privacy and compliance with security best practices.',
  },
  {
    icon: <IoCard />,
    color: 'var(--color-info)',
    title: 'Integrated Payments',
    desc: 'Streamlined billing interface to view and settle hospital invoices within the same ecosystem.',
  },
  {
    icon: <IoLockClosed />,
    color: 'var(--color-danger)',
    title: 'End-to-End Encryption',
    desc: 'All medical documents protected with encryption, both in transit and at rest, meeting PDPL standards.',
  },
  {
    icon: <IoPeople />,
    color: 'var(--color-info)',
    title: 'Patient-Centric',
    desc: 'Reducing diagnostic errors through comprehensive health record consolidation and smart access.',
  },
  {
    icon: <IoPulse />,
    color: 'var(--color-accent)',
    title: 'Audit Tracking',
    desc: 'Immutable audit logs tracking every access and modification for full regulatory compliance.',
  },
];

/* ---- Inline Auth Section ---- */
function InlineAuthSection() {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  return (
    <section className="landing-auth" id="auth-section">
      <div className="landing-auth__card">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tabs__tab ${activeTab === 'login' ? 'auth-tabs__tab--active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tabs__tab ${activeTab === 'signup' ? 'auth-tabs__tab--active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
        <div className="auth-card">
          {activeTab === 'login' ? <InlineLoginForm /> : <InlineSignUpForm />}
        </div>
      </div>
    </section>
  );
}

function InlineLoginForm() {
  const { email, setEmail, password, setPassword, error, isSubmitting, handleSubmit } = useLoginLogic();

  return (
    <>
      <h2 className="auth-page__title">Welcome Back</h2>
      <p className="auth-page__subtitle">Login to access your health records</p>
      {error && <div className="auth-page__error" role="alert">{error}</div>}
      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        <Input id="landing-login-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <Input id="landing-login-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>Login</Button>
      </form>
      <div className="auth-page__footer">
        <Link to="/auth/forgot-password" className="auth-page__link">Forgot password?</Link>
      </div>
    </>
  );
}

function InlineSignUpForm() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [patientId, setPatientId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/auth/signup', { state: { firstName, lastName, email, password, patientId } });
  };

  return (
    <>
      <h2 className="auth-page__title">Create Account</h2>
      <p className="auth-page__subtitle">Join MediSecure today</p>
      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        <div className="auth-page__row">
          <Input id="landing-signup-first" label="First Name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input id="landing-signup-last" label="Last Name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <Input id="landing-signup-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        <Input id="landing-signup-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        <Input id="landing-signup-patient-id" label="Patient ID (Optional)" placeholder="P-12345" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        <Button type="submit" variant="primary" size="lg" fullWidth>Create Account</Button>
      </form>
    </>
  );
}

/* ---- Main Landing Page ---- */
export default function LandingPage() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <Link to="/" className="landing-nav__brand">
            <IoShieldCheckmark className="landing-nav__icon" />
            <span>MediSecure</span>
          </Link>
          <div className="landing-nav__links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__heading">
            Cloud-Native Patient Empowerment Portal
          </h1>
          <p className="landing-hero__desc">
            Centralized, secure medical records management. Never lose critical health history between clinical handoffs.
          </p>
          <div className="landing-hero__actions">
            <a href="#auth-section">
              <Button variant="primary" size="lg">Get Started</Button>
            </a>
            <a href="#features">
              <Button variant="outline" size="lg">Learn More</Button>
            </a>
          </div>
        </div>
        <div className="landing-hero__image">
          <img src={heroImg} alt="Medical professional using computer with stethoscope on desk" />
        </div>
      </section>

      {/* Inline Auth */}
      <InlineAuthSection />

      {/* Core Features */}
      <section className="landing-features" id="features">
        <h2 className="landing-features__heading">Core Features</h2>
        <p className="landing-features__sub">
          Everything you need for secure, efficient medical record management
        </p>
        <div className="landing-features__grid">
          {FEATURES.map((f) => (
            <div className="landing-features__card" key={f.title}>
              <span className="landing-features__card-icon" style={{ color: f.color }}>
                {f.icon}
              </span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Silos */}
      <section className="landing-silos" id="about">
        <div className="landing-silos__text">
          <h2>Solving the Data Silos Problem</h2>
          <p>
            Traditional hospital systems often lead to fragmented patient histories scattered across multiple physical and digital locations. This creates significant risks:
          </p>
          <ul className="landing-silos__risks">
            <li><span className="landing-silos__x">×</span> Diagnostic errors from missing information</li>
            <li><span className="landing-silos__x">×</span> Lost records between clinical handoffs</li>
            <li><span className="landing-silos__x">×</span> Poor patient experience and lack of transparency</li>
          </ul>
          <p>
            MediSecure implements a <strong>patient-centric architecture</strong> that centralizes all health records, ensuring they're always accessible when needed.
          </p>
        </div>
        <div className="landing-silos__image">
          <img src={doctorImg} alt="Doctor reviewing documents with patient" />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="contact">
        <div className="landing-footer__inner">
          <div className="landing-footer__col">
            <div className="landing-footer__brand">
              <IoShieldCheckmark />
              <span>MediSecure</span>
            </div>
            <p className="landing-footer__tagline">Cloud-Native Patient Empowerment Portal</p>
          </div>
          <div className="landing-footer__col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#features">Pricing</a>
            <a href="#features">Security</a>
          </div>
          <div className="landing-footer__col">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#about">Careers</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="landing-footer__col">
            <h4>Legal</h4>
            <a href="#contact">Privacy Policy</a>
            <a href="#contact">Terms of Service</a>
            <a href="#contact">Compliance</a>
          </div>
        </div>
        <div className="landing-footer__bottom">
          © 2026 MediSecure. All rights reserved. Team 4
        </div>
      </footer>
    </div>
  );
}
