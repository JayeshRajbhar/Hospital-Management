"use client";

import { useState } from "react";
import { useHospital } from "../../../components/hospital/HospitalProvider";

export default function PatientsPage() {
  const { patients, actions, pushNotice, isBusy } = useHospital();
  const [admitForm, setAdmitForm] = useState({ id: "", name: "", disease: "" });
  const [dischargeId, setDischargeId] = useState("");

  async function handleAdmitSubmit(event) {
    event.preventDefault();
    const result = await actions.admitPatient(admitForm);
    pushNotice(result.ok ? "success" : "error", result.message);
    if (result.ok) {
      setAdmitForm({ id: "", name: "", disease: "" });
    }
  }

  async function handleDischargeSubmit(event) {
    event.preventDefault();
    const result = await actions.dischargePatient(dischargeId);
    pushNotice(result.ok ? "success" : "error", result.message);
    if (result.ok) {
      setDischargeId("");
    }
  }

  return (
    <div className="dashboard-stack">
      <section className="two-col-grid">
        <article className="panel">
          <div className="panel-head">
            <h3>Admit Patient</h3>
            <p>Assign patient to first available room.</p>
          </div>
          <form className="form-grid three-col" onSubmit={handleAdmitSubmit}>
            <label className="field">
              Patient ID
              <input
                type="number"
                min="1"
                value={admitForm.id}
                onChange={(event) =>
                  setAdmitForm((previous) => ({
                    ...previous,
                    id: event.target.value,
                  }))
                }
                placeholder="e.g. 1001"
              />
            </label>
            <label className="field">
              Name
              <input
                value={admitForm.name}
                onChange={(event) =>
                  setAdmitForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Rahul Sharma"
              />
            </label>
            <label className="field">
              Disease
              <input
                value={admitForm.disease}
                onChange={(event) =>
                  setAdmitForm((previous) => ({
                    ...previous,
                    disease: event.target.value,
                  }))
                }
                placeholder="e.g. Migraine"
              />
            </label>
            <button className="btn-primary" type="submit" disabled={isBusy}>
              {isBusy ? "Saving..." : "Admit Patient"}
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3>Discharge Patient</h3>
            <p>Release room by patient ID.</p>
          </div>
          <form className="form-grid" onSubmit={handleDischargeSubmit}>
            <label className="field">
              Patient ID
              <input
                type="number"
                min="1"
                value={dischargeId}
                onChange={(event) => setDischargeId(event.target.value)}
                placeholder="e.g. 1001"
              />
            </label>
            <button className="btn-secondary" type="submit" disabled={isBusy}>
              {isBusy ? "Saving..." : "Discharge"}
            </button>
          </form>
        </article>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Admitted Patient Register</h3>
          <p>Live patient list currently in rooms.</p>
        </div>
        {patients.length === 0 ? (
          <p className="empty-state">No admitted patients.</p>
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
                {patients.map((patient) => (
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
      </section>
    </div>
  );
}
