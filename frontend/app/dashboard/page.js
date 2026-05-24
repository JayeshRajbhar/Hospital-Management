"use client";

import Link from "next/link";
import MetricGrid from "../../components/dashboard/MetricGrid";
import { useHospital } from "../../components/hospital/HospitalProvider";

export default function DashboardOverviewPage() {
  const { patients, doctors, rooms } = useHospital();

  const recentPatients = patients.slice(0, 6);
  const doctorsOnDuty = doctors.filter((doctor) => doctor.available).slice(0, 6);
  const nextAvailableRooms = rooms.filter((room) => !room.patient).slice(0, 6);

  return (
    <div className="dashboard-stack">
      <section className="hero-panel">
        <div>
          <h3>Hospital Command Center</h3>
          <p>
            Track admissions, occupancy, doctor coverage, and attendance from
            dedicated dashboard modules.
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/dashboard/patients" className="button-link">
            Manage Admissions
          </Link>
          <Link href="/dashboard/rooms" className="button-link button-link-muted">
            Open Room Board
          </Link>
        </div>
      </section>

      <MetricGrid />

      <section className="two-col-grid">
        <article className="panel">
          <div className="panel-head">
            <h3>Admitted Patients</h3>
            <p>Current bed occupancy by patient.</p>
          </div>
          {recentPatients.length === 0 ? (
            <p className="empty-state">No admitted patients right now.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Disease</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td>{patient.name}</td>
                      <td>{patient.disease}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3>Doctors On Duty</h3>
            <p>Available specialists ready for allocation.</p>
          </div>
          {doctorsOnDuty.length === 0 ? (
            <p className="empty-state">No available doctors at the moment.</p>
          ) : (
            <ul className="compact-list">
              {doctorsOnDuty.map((doctor) => (
                <li key={doctor.id}>
                  <div>
                    <p className="row-title">{doctor.name}</p>
                    <p className="row-subtitle">{doctor.specialization}</p>
                  </div>
                  <span className="status-pill live">Available</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Next Available Rooms</h3>
          <p>Fast view for admission planning.</p>
        </div>
        {nextAvailableRooms.length === 0 ? (
          <p className="empty-state">No rooms currently available.</p>
        ) : (
          <div className="chip-wrap">
            {nextAvailableRooms.map((room) => (
              <span className="room-chip" key={room.roomNumber}>
                Room {room.roomNumber}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
