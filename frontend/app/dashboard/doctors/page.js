"use client";

import { useState } from "react";
import DoctorList from "../../../components/DoctorList";
import { useHospital } from "../../../components/hospital/HospitalProvider";

export default function DoctorsPage() {
  const { doctors, actions, pushNotice, isBusy } = useHospital();
  const [form, setForm] = useState({ id: "", name: "", specialization: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await actions.addDoctor(form);
    pushNotice(result.ok ? "success" : "error", result.message);
    if (result.ok) {
      setForm({ id: "", name: "", specialization: "" });
    }
  }

  async function handleToggle(doctorId) {
    const result = await actions.toggleDoctorAvailability(doctorId);
    pushNotice(result.ok ? "info" : "error", result.message);
  }

  return (
    <div className="dashboard-stack">
      <section className="panel">
        <div className="panel-head">
          <h3>Add Doctor</h3>
          <p>Register doctor and set initial availability.</p>
        </div>
        <form className="form-grid three-col" onSubmit={handleSubmit}>
          <label className="field">
            Doctor ID
            <input
              type="number"
              min="1"
              value={form.id}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, id: event.target.value }))
              }
              placeholder="e.g. 21"
            />
          </label>
          <label className="field">
            Name
            <input
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, name: event.target.value }))
              }
              placeholder="e.g. Dr. Mehta"
            />
          </label>
          <label className="field">
            Specialization
            <input
              value={form.specialization}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  specialization: event.target.value,
                }))
              }
              placeholder="e.g. Neurology"
            />
          </label>
          <button className="btn-primary" type="submit" disabled={isBusy}>
            {isBusy ? "Saving..." : "Add Doctor"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Doctor Roster</h3>
          <p>Toggle doctor availability for live shift changes.</p>
        </div>
        <DoctorList
          doctors={doctors}
          onToggleAvailability={handleToggle}
          busy={isBusy}
        />
      </section>
    </div>
  );
}
