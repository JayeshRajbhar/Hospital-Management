import DashboardShell from "../../components/dashboard/DashboardShell";
import NoticeBanner from "../../components/dashboard/NoticeBanner";
import { HospitalProvider } from "../../components/hospital/HospitalProvider";
import { getDoctors, getRooms, getStaff, getStatus } from "../../lib/api";

export default async function DashboardLayout({ children }) {
  const [status, rooms, doctors, staff] = await Promise.all([
    getStatus(),
    getRooms(),
    getDoctors(),
    getStaff(),
  ]);

  return (
    <HospitalProvider
      initialStatus={status}
      initialRooms={rooms}
      initialDoctors={doctors}
      initialStaff={staff}
    >
      <DashboardShell>
        <NoticeBanner />
        {children}
      </DashboardShell>
    </HospitalProvider>
  );
}
