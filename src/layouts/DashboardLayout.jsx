/**
 * Dashboard Layout — sidebar + header + content area.
 * Owner: Kyrillos (Shared UI / Navigation)
 */
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import './DashboardLayout.css';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-layout__main">
        <Header />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
