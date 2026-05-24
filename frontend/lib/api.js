const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

const API_ENDPOINTS = {
  status: process.env.NEXT_PUBLIC_API_STATUS_PATH || "/api/status",
  rooms: process.env.NEXT_PUBLIC_API_ROOMS_PATH || "/api/rooms",
  doctors: process.env.NEXT_PUBLIC_API_DOCTORS_PATH || "/api/doctors",
  staff: process.env.NEXT_PUBLIC_API_STAFF_PATH || "/api/staff",
  admitPatient:
    process.env.NEXT_PUBLIC_API_ADMIT_PATIENT_PATH || "/api/patients/admit",
  dischargePatient:
    process.env.NEXT_PUBLIC_API_DISCHARGE_PATIENT_PATH ||
    "/api/patients/discharge/{patientId}",
  addDoctor: process.env.NEXT_PUBLIC_API_ADD_DOCTOR_PATH || "/api/doctors",
  toggleDoctorAvailability:
    process.env.NEXT_PUBLIC_API_TOGGLE_DOCTOR_AVAILABILITY_PATH ||
    "/api/doctors/{doctorId}/availability",
  checkInStaff:
    process.env.NEXT_PUBLIC_API_STAFF_CHECKIN_PATH || "/api/staff/checkin",
  checkOutStaff:
    process.env.NEXT_PUBLIC_API_STAFF_CHECKOUT_PATH ||
    "/api/staff/checkout/{staffId}",
};

function buildUrl(path) {
  return `${API_BASE}${path}`;
}

function interpolatePath(path, replacements) {
  return Object.entries(replacements).reduce(
    (resolvedPath, [key, value]) =>
      resolvedPath.replaceAll(`{${key}}`, encodeURIComponent(String(value))),
    path
  );
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    cache: "no-store",
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed: ${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

async function getJson(path, fallback) {
  try {
    const data = await request(path);
    return data ?? fallback;
  } catch (error) {
    return fallback;
  }
}

export async function getStatus() {
  return getJson(API_ENDPOINTS.status, {
    totalRooms: 0,
    occupiedRooms: 0,
    doctorCount: 0,
    patientCount: 0,
    staffCheckedIn: 0,
    offline: true,
  });
}

export async function getRooms() {
  return getJson(API_ENDPOINTS.rooms, []);
}

export async function getDoctors() {
  return getJson(API_ENDPOINTS.doctors, []);
}

export async function getStaff() {
  return getJson(API_ENDPOINTS.staff, []);
}

export async function refreshHospitalSnapshot() {
  const [status, rooms, doctors, staff] = await Promise.all([
    getStatus(),
    getRooms(),
    getDoctors(),
    getStaff(),
  ]);

  return { status, rooms, doctors, staff };
}

export async function admitPatient(payload) {
  return request(API_ENDPOINTS.admitPatient, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function dischargePatient(patientId) {
  return request(
    interpolatePath(API_ENDPOINTS.dischargePatient, { patientId }),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }
  );
}

export async function addDoctor(payload) {
  return request(API_ENDPOINTS.addDoctor, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function toggleDoctorAvailability(doctorId, available) {
  return request(
    interpolatePath(API_ENDPOINTS.toggleDoctorAvailability, { doctorId }),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available }),
    }
  );
}

export async function checkInStaff(payload) {
  return request(API_ENDPOINTS.checkInStaff, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function checkOutStaff(staffId) {
  return request(interpolatePath(API_ENDPOINTS.checkOutStaff, { staffId }), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}
