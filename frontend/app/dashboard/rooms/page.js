"use client";

import RoomList from "../../../components/RoomList";
import { useHospital } from "../../../components/hospital/HospitalProvider";

export default function RoomsPage() {
  const { rooms, metrics, actions, pushNotice, isBusy } = useHospital();

  async function handleDischarge(patientId) {
    const result = await actions.dischargePatient(patientId);
    pushNotice(result.ok ? "success" : "error", result.message);
  }

  return (
    <div className="dashboard-stack">
      <section className="metric-inline">
        <article>
          <p className="metric-inline-label">Total Rooms</p>
          <p className="metric-inline-value">{metrics.totalRooms}</p>
        </article>
        <article>
          <p className="metric-inline-label">Occupied</p>
          <p className="metric-inline-value">{metrics.occupiedRooms}</p>
        </article>
        <article>
          <p className="metric-inline-label">Available</p>
          <p className="metric-inline-value">{metrics.availableRooms}</p>
        </article>
        <article>
          <p className="metric-inline-label">Utilization</p>
          <p className="metric-inline-value">{metrics.bedUtilization}%</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Room Occupancy Matrix</h3>
          <p>Room-by-room view with one-click discharge.</p>
        </div>
        <RoomList rooms={rooms} onDischarge={handleDischarge} busy={isBusy} />
      </section>
    </div>
  );
}
