"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHospital } from "../hospital/HospitalProvider";

const navigationItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/rooms", label: "Rooms" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/staff", label: "Staff" },
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
  const { metrics, backendOnline } = useHospital();
  const title = pageTitles[pathname] || "Hospital Dashboard";

  return (
    <div className="dashboard-app">
      <aside className="dashboard-sidebar">
        <div className="brand-wrap">
          <p className="brand-eyebrow">Hospital System</p>
          <h1 className="brand-title">Care Command</h1>
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
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

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
      </aside>

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
