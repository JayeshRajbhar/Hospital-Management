"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHospital } from "../hospital/HospitalProvider";

// Professional SVG Icon Definitions
const OverviewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const PatientsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const RoomsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
  </svg>
);

const DoctorsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const StaffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#0ea5e9" }}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navigationItems = [
  { href: "/dashboard", label: "Overview", icon: <OverviewIcon /> },
  { href: "/dashboard/patients", label: "Patients", icon: <PatientsIcon /> },
  { href: "/dashboard/rooms", label: "Rooms", icon: <RoomsIcon /> },
  { href: "/dashboard/doctors", label: "Doctors", icon: <DoctorsIcon /> },
  { href: "/dashboard/staff", label: "Staff", icon: <StaffIcon /> },
];

const pageTitles = {
  "/dashboard": "Operations Overview",
  "/dashboard/patients": "Patient Admission Desk",
  "/dashboard/rooms": "Room Occupancy Board",
  "/dashboard/doctors": "Doctor Coverage",
  "/dashboard/staff": "Staff Attendance",
};

function formatDateTime() {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { metrics, backendOnline, username, actions } = useHospital();
  const title = pageTitles[pathname] || "Hospital Dashboard";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (actions && typeof actions.logout === "function") {
      actions.logout();
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      if (actions && typeof actions.deleteAccount === "function") {
        await actions.deleteAccount();
      }
    }
  };

  return (
    <div className="dashboard-app">
      {/* Mobile Topbar */}
      <header className="mobile-topbar">
        <button
          type="button"
          className="btn-mobile-menu"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <div className="mobile-brand-group">
          <LogoIcon />
          <h1 className="mobile-app-name">Care Command</h1>
          <span className={`sync-pill-dot ${backendOnline ? "live" : "muted"}`}></span>
        </div>
        <div className="mobile-user-group">
          <span className="mobile-username" title={`Logged in as ${username || "Admin"}`}>
            {username || "Admin"}
          </span>
          <button type="button" className="btn-mobile-logout" onClick={handleLogout} aria-label="Sign Out" title="Sign Out">
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar (collapsible drawer on mobile) */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="brand-wrap">
          <div className="brand-header-row">
            <div>
              <p className="brand-eyebrow">Hospital System</p>
              <h1 className="brand-title">Care Command</h1>
            </div>
            <button
              type="button"
              className="btn-sidebar-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="brand-subtitle">Clinical operations control panel</p>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-metrics-container">
          <div className="sidebar-card">
            <p className="sidebar-card-label">Bed Utilization</p>
            <p className="sidebar-card-value">{metrics.bedUtilization}%</p>
            <p className="sidebar-card-note">
              {metrics.occupiedRooms}/{metrics.totalRooms} rooms occupied
            </p>
          </div>

          <div className="sidebar-card">
            <p className="sidebar-card-label">On-site Staff</p>
            <p className="sidebar-card-value">{metrics.staffCheckedIn}</p>
            <p className="sidebar-card-note">Checked in and ready</p>
          </div>
        </div>

        {/* User Profile Badge at the bottom of sidebar */}
        <div className="sidebar-profile">
          <div className="profile-details">
            <div className="profile-avatar">
              <UserIcon />
            </div>
            <div className="profile-meta">
              <p className="profile-username">{username || "Administrator"}</p>
              <p className="profile-role">System Admin</p>
            </div>
          </div>
          <div className="profile-actions-buttons">
            <button type="button" className="btn-logout" onClick={handleLogout}>
              Sign Out
            </button>
            <button type="button" className="btn-delete-account" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="topbar-kicker">Hospital Operations</p>
            <h2 className="topbar-title">{title}</h2>
          </div>
          <div className="topbar-meta">
            <span className={`sync-pill ${backendOnline ? "live" : "muted"}`}>
              {backendOnline ? "Backend Connected" : "Backend Offline"}
            </span>
            <p className="topbar-time">{formatDateTime()}</p>
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
