export default function DoctorList({ doctors, onToggleAvailability, busy = false }) {
  if (!doctors || doctors.length === 0) {
    return <div className="empty">No doctor data loaded yet.</div>;
  }

  return (
    <div className="stack-list">
      {doctors.map((doctor) => (
        <div className="list-row" key={doctor.id}>
          <div>
            <div className="row-title">
              {doctor.name} <span className="id-chip">#{doctor.id}</span>
            </div>
            <div className="row-subtitle">{doctor.specialization}</div>
          </div>
          <div className="row-actions">
            <span
              className={`pill ${
                doctor.available ? "pill-live" : "pill-muted"
              }`}
            >
              {doctor.available ? "Available" : "Unavailable"}
            </span>
            {typeof onToggleAvailability === "function" ? (
              <button
                type="button"
                className="btn-table-primary"
                disabled={busy}
                onClick={() => onToggleAvailability(doctor.id)}
              >
                Mark {doctor.available ? "Unavailable" : "Available"}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
