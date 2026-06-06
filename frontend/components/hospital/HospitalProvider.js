"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUsername, getAuthToken, clearAuthToken } from "../../lib/auth";
import {
  addDoctor as addDoctorApi,
  admitPatient as admitPatientApi,
  checkInStaff as checkInStaffApi,
  checkOutStaff as checkOutStaffApi,
  dischargePatient as dischargePatientApi,
  refreshHospitalSnapshot,
  toggleDoctorAvailability as toggleDoctorAvailabilityApi,
  logout as logoutApi,
  deleteAccount as deleteAccountApi,
} from "../../lib/api";

const HospitalContext = createContext(null);
const FALLBACK_ROOM_COUNT = 3;

function toPositiveNumber(value, fallback) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
}

function normalizeDoctors(doctors) {
  if (!Array.isArray(doctors)) {
    return [];
  }

  return doctors.map((doctor, index) => {
    const fallbackId = index + 1;
    return {
      id: toPositiveNumber(doctor?.id, fallbackId),
      name: doctor?.name || `Doctor ${fallbackId}`,
      specialization: doctor?.specialization || "General Medicine",
      available: doctor?.available !== false,
    };
  });
}

function buildPatientRecord(room, index) {
  if (room?.patient) {
    return {
      id: toPositiveNumber(room.patient.id, index + 1),
      name: room.patient.name || `Patient ${index + 1}`,
      disease: room.patient.disease || room.disease || "Under observation",
      admitted: room.patient.admitted !== false,
    };
  }

  const isOccupied = room?.occupied || room?.patientName;
  if (!isOccupied) {
    return null;
  }

  return {
    id: toPositiveNumber(room.patientId, index + 1),
    name: room.patientName || `Patient ${index + 1}`,
    disease: room.disease || "Under observation",
    admitted: true,
  };
}

function normalizeRooms(rooms, totalRooms) {
  const normalizedFromApi = Array.isArray(rooms)
    ? rooms.map((room, index) => ({
        roomNumber: toPositiveNumber(room?.roomNumber, index + 1),
        patient: buildPatientRecord(room, index),
      }))
    : [];

  const maxRoomNumber = normalizedFromApi.reduce(
    (max, room) => Math.max(max, room.roomNumber),
    0
  );

  const resolvedRoomCount = Math.max(
    toPositiveNumber(totalRooms, 0),
    maxRoomNumber,
    FALLBACK_ROOM_COUNT
  );

  const roomMap = new Map();
  normalizedFromApi.forEach((room) => {
    roomMap.set(room.roomNumber, room);
  });

  const generatedRooms = [];
  for (let roomNumber = 1; roomNumber <= resolvedRoomCount; roomNumber += 1) {
    generatedRooms.push(roomMap.get(roomNumber) || { roomNumber, patient: null });
  }

  return generatedRooms;
}

function buildInitialState(status, rooms, doctors) {
  const normalizedDoctors = normalizeDoctors(doctors).sort((a, b) => a.id - b.id);
  const normalizedRooms = normalizeRooms(rooms, status?.totalRooms).sort(
    (a, b) => a.roomNumber - b.roomNumber
  );

  const checkedInCount = toPositiveNumber(status?.staffCheckedIn, 0);
  const staff = Array.from({ length: checkedInCount }, (_, index) => ({
    staffId: 500 + index,
    staffName: `Staff ${index + 1}`,
    checkedIn: true,
  }));

  return {
    rooms: normalizedRooms,
    doctors: normalizedDoctors,
    staff,
  };
}

function normalizeStaff(staffList) {
  if (!Array.isArray(staffList)) {
    return [];
  }

  return staffList
    .map((member, index) => ({
      staffId: toPositiveNumber(member?.staffId, index + 1),
      staffName: member?.staffName || `Staff ${index + 1}`,
      checkedIn: member?.checkedIn === true,
    }))
    .sort((a, b) => a.staffId - b.staffId);
}

function isValidId(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0;
}

function errorMessage(error, fallback) {
  return error?.message || fallback;
}

export function HospitalProvider({
  initialStatus = null,
  initialRooms = [],
  initialDoctors = [],
  initialStaff = [],
  children,
}) {
  const seededState = useMemo(
    () => {
      const state = buildInitialState(initialStatus, initialRooms, initialDoctors);
      const normalizedInitialStaff = normalizeStaff(initialStaff);
      if (normalizedInitialStaff.length > 0) {
        state.staff = normalizedInitialStaff;
      }
      return state;
    },
    [initialStatus, initialRooms, initialDoctors, initialStaff]
  );

  const [rooms, setRooms] = useState(seededState.rooms);
  const [doctors, setDoctors] = useState(seededState.doctors);
  const [staff, setStaff] = useState(seededState.staff);
  const [isBusy, setIsBusy] = useState(false);
  const [backendOnline, setBackendOnline] = useState(initialStatus?.offline !== true);
  const [username, setUsername] = useState(null);
  const [notice, setNotice] = useState(
    initialStatus?.offline
      ? {
          type: "warning",
          text: "Backend sync is unavailable. Check your Spring Boot server and CORS settings.",
        }
      : null
  );

  const router = useRouter();

  useEffect(() => {
    async function initAuthAndData() {
      const activeUser = await getAuthUsername();
      setUsername(activeUser);

      const token = await getAuthToken();
      if (token) {
        setIsBusy(true);
        try {
          await syncFromBackend();
        } catch (err) {
          console.error("Failed to sync backend data", err);
          setBackendOnline(false);
        } finally {
          setIsBusy(false);
        }
      }
    }
    initAuthAndData();
  }, []);

  const patients = useMemo(
    () => rooms.map((room) => room.patient).filter(Boolean),
    [rooms]
  );

  const metrics = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((room) => room.patient).length;
    const availableDoctors = doctors.filter((doctor) => doctor.available).length;
    const staffCheckedIn = staff.filter((member) => member.checkedIn).length;
    const bedUtilization = totalRooms
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      patientCount: patients.length,
      doctorCount: doctors.length,
      availableDoctors,
      staffCheckedIn,
      bedUtilization,
    };
  }, [rooms, doctors, staff, patients.length]);

  function pushNotice(type, text) {
    setNotice({ type, text });
  }

  function clearNotice() {
    setNotice(null);
  }

  function hydrateFromSnapshot(snapshot) {
    const nextState = buildInitialState(
      snapshot.status,
      snapshot.rooms,
      snapshot.doctors
    );
    const nextStaff = normalizeStaff(snapshot.staff);
    setRooms(nextState.rooms);
    setDoctors(nextState.doctors);
    setStaff(nextStaff.length > 0 ? nextStaff : nextState.staff);
    setBackendOnline(snapshot.status?.offline !== true);
  }

  async function syncFromBackend() {
    const snapshot = await refreshHospitalSnapshot();
    hydrateFromSnapshot(snapshot);
    return snapshot;
  }

  async function withNetworkAction(requestAction, fallbackError) {
    setIsBusy(true);
    try {
      const payload = await requestAction();
      await syncFromBackend();
      return { ok: true, payload };
    } catch (error) {
      setBackendOnline(false);
      return { ok: false, message: errorMessage(error, fallbackError) };
    } finally {
      setIsBusy(false);
    }
  }

  async function admitPatient({ id, name, disease }) {
    const patientId = Number(id);
    const patientName = String(name || "").trim();
    const patientDisease = String(disease || "").trim();

    if (!isValidId(patientId) || !patientName || !patientDisease) {
      return { ok: false, message: "Patient ID, name, and disease are required." };
    }

    const result = await withNetworkAction(
      () =>
        admitPatientApi({
          id: patientId,
          name: patientName,
          disease: patientDisease,
        }),
      "Failed to admit patient from backend."
    );

    if (!result.ok) {
      return result;
    }

    return { ok: true, message: `${patientName} admitted successfully.` };
  }

  async function dischargePatient(patientId) {
    const resolvedPatientId = Number(patientId);
    if (!isValidId(resolvedPatientId)) {
      return { ok: false, message: "Enter a valid patient ID to discharge." };
    }

    const result = await withNetworkAction(
      () => dischargePatientApi(resolvedPatientId),
      "Failed to discharge patient from backend."
    );

    if (!result.ok) {
      return result;
    }

    return { ok: true, message: `Patient #${resolvedPatientId} discharged.` };
  }

  async function addDoctor({ id, name, specialization }) {
    const doctorId = Number(id);
    const doctorName = String(name || "").trim();
    const doctorSpecialization = String(specialization || "").trim();

    if (!isValidId(doctorId) || !doctorName || !doctorSpecialization) {
      return {
        ok: false,
        message: "Doctor ID, name, and specialization are required.",
      };
    }

    const result = await withNetworkAction(
      () =>
        addDoctorApi({
          id: doctorId,
          name: doctorName,
          specialization: doctorSpecialization,
        }),
      "Failed to add doctor from backend."
    );

    if (!result.ok) {
      return result;
    }

    return { ok: true, message: `${doctorName} added successfully.` };
  }

  async function toggleDoctorAvailability(doctorId) {
    const resolvedDoctorId = Number(doctorId);
    if (!isValidId(resolvedDoctorId)) {
      return { ok: false, message: "Invalid doctor ID." };
    }

    const doctor = doctors.find((entry) => entry.id === resolvedDoctorId);
    if (!doctor) {
      return { ok: false, message: "Doctor not found." };
    }

    const targetAvailability = !doctor.available;
    const result = await withNetworkAction(
      () => toggleDoctorAvailabilityApi(resolvedDoctorId, targetAvailability),
      "Failed to update doctor availability."
    );

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      message: `${doctor.name} marked ${
        targetAvailability ? "available" : "unavailable"
      }.`,
    };
  }

  async function checkInStaff({ id, name }) {
    const staffId = Number(id);
    const staffName = String(name || "").trim();

    if (!isValidId(staffId) || !staffName) {
      return { ok: false, message: "Staff ID and name are required for check-in." };
    }

    const result = await withNetworkAction(
      () =>
        checkInStaffApi({
          staffId,
          staffName,
        }),
      "Failed to check in staff from backend."
    );

    if (!result.ok) {
      return result;
    }

    setStaff((previous) => {
      const existing = previous.find((entry) => entry.staffId === staffId);
      if (existing) {
        return previous.map((entry) =>
          entry.staffId === staffId
            ? { ...entry, staffName, checkedIn: true }
            : entry
        );
      }
      return [...previous, { staffId, staffName, checkedIn: true }];
    });

    return { ok: true, message: `${staffName} checked in.` };
  }

  async function checkOutStaff(staffId) {
    const resolvedStaffId = Number(staffId);
    if (!isValidId(resolvedStaffId)) {
      return { ok: false, message: "Enter a valid staff ID for check-out." };
    }

    const result = await withNetworkAction(
      () => checkOutStaffApi(resolvedStaffId),
      "Failed to check out staff from backend."
    );

    if (!result.ok) {
      return result;
    }

    setStaff((previous) =>
      previous.map((entry) =>
        entry.staffId === resolvedStaffId ? { ...entry, checkedIn: false } : entry
      )
    );

    return { ok: true, message: `Staff #${resolvedStaffId} checked out.` };
  }

  async function logout() {
    setIsBusy(true);
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      await clearAuthToken();
      setUsername(null);
      setIsBusy(false);
      router.push("/login");
    }
  }

  async function deleteAccount() {
    setIsBusy(true);
    try {
      const response = await deleteAccountApi();
      pushNotice("success", response?.message || "Account deleted successfully.");
    } catch (error) {
      console.error("Account deletion failed", error);
      pushNotice("error", error?.message || "Failed to delete account.");
    } finally {
      await clearAuthToken();
      setUsername(null);
      setIsBusy(false);
      router.push("/signup");
    }
  }

  const value = {
    rooms,
    doctors,
    staff,
    patients,
    metrics,
    notice,
    isBusy,
    backendOnline,
    username,
    clearNotice,
    pushNotice,
    actions: {
      admitPatient,
      dischargePatient,
      addDoctor,
      toggleDoctorAvailability,
      checkInStaff,
      checkOutStaff,
      syncFromBackend,
      logout,
      deleteAccount,
    },
  };

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error("useHospital must be used inside HospitalProvider.");
  }
  return context;
}
