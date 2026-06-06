"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../components/dashboard/DashboardShell";
import NoticeBanner from "../../components/dashboard/NoticeBanner";
import { HospitalProvider } from "../../components/hospital/HospitalProvider";
import { getAuthToken } from "../../lib/auth";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSecurity() {
      const token = await getAuthToken();
      if (!token) {
        router.push("/login");
      } else {
        setAuthorized(true);
      }
      setCheckingAuth(false);
    }
    checkSecurity();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="auth-splash-screen">
        <div className="pulse-spinner"></div>
        <p className="auth-splash-text">Verifying session credentials...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <HospitalProvider>
      <DashboardShell>
        <NoticeBanner />
        {children}
      </DashboardShell>
    </HospitalProvider>
  );
}
