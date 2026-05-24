"use client";

import { useHospital } from "../hospital/HospitalProvider";

export default function NoticeBanner() {
  const { notice, clearNotice } = useHospital();

  if (!notice) {
    return null;
  }

  return (
    <section className={`notice-banner notice-${notice.type}`} role="status">
      <p>{notice.text}</p>
      <button type="button" className="notice-close" onClick={clearNotice}>
        Dismiss
      </button>
    </section>
  );
}
