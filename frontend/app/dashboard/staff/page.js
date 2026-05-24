"use client";

import { useState } from "react";
import { useHospital } from "../../../components/hospital/HospitalProvider";

export default function StaffPage() {
  const { staff, actions, pushNotice, isBusy } = useHospital();
  const [checkInForm, setCheckInForm] = useState({ id: "", name: "" });
  const [checkOutId, setCheckOutId] = useState("");

  async function handleCheckIn(event) {
    event.preventDefault();
    const result = await actions.checkInStaff(checkInForm);
    pushNotice(result.ok ? "success" : "error", result.message);
    if (result.ok) {
      setCheckInForm({ id: "", name: "" });
    }
  }

  async function handleCheckOut(event) {
    event.preventDefault();
    const result = await actions.checkOutStaff(checkOutId);
    pushNotice(result.ok ? "info" : "error", result.message);
    if (result.ok) {
      setCheckOutId("");
    }
  }

  async function handleRowAction(member) {
    const result = member.checkedIn
      ? await actions.checkOutStaff(member.staffId)
      : await actions.checkInStaff({ id: member.staffId, name: member.staffName });
    pushNotice(result.ok ? (member.checkedIn ? "info" : "success") : "error", result.message);
  }

  return (
    <div className="dashboard-stack">
      <section className="two-col-grid">
        <article className="panel">
          <div className="panel-head">
            <h3>Staff Check In</h3>
            <p>Register team members starting shift.</p>
          </div>
          <form className="form-grid" onSubmit={handleCheckIn}>
            <label className="field">
              Staff ID
              <input
                type="number"
                min="1"
                value={checkInForm.id}
                onChange={(event) =>
                  setCheckInForm((previous) => ({
                    ...previous,
                    id: event.target.value,
                  }))
                }
                placeholder="e.g. 101"
              />
            </label>
            <label className="field">
              Staff Name
              <input
                value={checkInForm.name}
                onChange={(event) =>
                  setCheckInForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Ramesh"
              />
            </label>
            <button className="btn-primary" type="submit" disabled={isBusy}>
              {isBusy ? "Saving..." : "Check In"}
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3>Staff Check Out</h3>
            <p>Mark staff as off duty by ID.</p>
          </div>
          <form className="form-grid" onSubmit={handleCheckOut}>
            <label className="field">
              Staff ID
              <input
                type="number"
                min="1"
                value={checkOutId}
                onChange={(event) => setCheckOutId(event.target.value)}
                placeholder="e.g. 101"
              />
            </label>
            <button className="btn-secondary" type="submit" disabled={isBusy}>
              {isBusy ? "Saving..." : "Check Out"}
            </button>
          </form>
        </article>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Attendance Register</h3>
          <p>Current in/out status for all tracked staff.</p>
        </div>
        {staff.length === 0 ? (
          <p className="empty-state">No staff attendance records yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staff
                  .slice()
                  .sort((a, b) => a.staffId - b.staffId)
                  .map((member) => (
                    <tr key={member.staffId}>
                      <td>{member.staffId}</td>
                      <td>{member.staffName}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            member.checkedIn ? "live" : "muted"
                          }`}
                        >
                          {member.checkedIn ? "Checked In" : "Checked Out"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={
                            member.checkedIn ? "btn-table-danger" : "btn-table-primary"
                          }
                          disabled={isBusy}
                          onClick={() => handleRowAction(member)}
                        >
                          {member.checkedIn ? "Check Out" : "Check In"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
