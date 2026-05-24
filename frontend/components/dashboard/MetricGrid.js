"use client";

import { useHospital } from "../hospital/HospitalProvider";

export default function MetricGrid() {
  const { metrics } = useHospital();

  const items = [
    {
      label: "Total Rooms",
      value: metrics.totalRooms,
      hint: `${metrics.availableRooms} available`,
    },
    {
      label: "Occupied Rooms",
      value: metrics.occupiedRooms,
      hint: `${metrics.bedUtilization}% utilization`,
    },
    {
      label: "Admitted Patients",
      value: metrics.patientCount,
      hint: "Live admitted count",
    },
    {
      label: "Doctor Coverage",
      value: `${metrics.availableDoctors}/${metrics.doctorCount}`,
      hint: "Available vs total",
    },
    {
      label: "Staff Checked In",
      value: metrics.staffCheckedIn,
      hint: "Active on-site",
    },
  ];

  return (
    <section className="metric-grid" aria-label="Hospital KPIs">
      {items.map((item) => (
        <article key={item.label} className="metric-card">
          <p className="metric-label">{item.label}</p>
          <p className="metric-value">{item.value}</p>
          <p className="metric-hint">{item.hint}</p>
        </article>
      ))}
    </section>
  );
}
