export default function RoomList({ rooms, onDischarge, busy = false }) {
  if (!rooms || rooms.length === 0) {
    return <div className="empty">No room data loaded yet.</div>;
  }

  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <article
          key={room.roomNumber}
          className={`room-card ${room.patient ? "occupied" : "available"}`}
        >
          <div className="room-header">
            <h3 className="room-title">Room {room.roomNumber}</h3>
            <span className={`room-status ${room.patient ? "busy" : "free"}`}>
              {room.patient ? "Occupied" : "Available"}
            </span>
          </div>

          {room.patient ? (
            <div className="room-patient">
              <p className="room-patient-name">{room.patient.name}</p>
              <dl className="meta">
                <div>
                  <dt>Patient ID</dt>
                  <dd>{room.patient.id}</dd>
                </div>
                <div>
                  <dt>Disease</dt>
                  <dd>{room.patient.disease}</dd>
                </div>
              </dl>
              {typeof onDischarge === "function" ? (
                <button
                  type="button"
                  className="btn-table-danger"
                  disabled={busy}
                  onClick={() => onDischarge(room.patient.id)}
                >
                  Discharge
                </button>
              ) : null}
            </div>
          ) : (
            <p className="room-empty">No patient assigned.</p>
          )}
        </article>
      ))}
    </div>
  );
}
