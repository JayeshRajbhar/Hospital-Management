package com.example.hospital.service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.hospital.dto.RoomResponse;
import com.example.hospital.dto.StaffRequest;
import com.example.hospital.dto.StaffResponse;
import com.example.hospital.dto.StatusResponse;
import com.example.hospital.entity.Doctor;
import com.example.hospital.entity.Patient;
import com.example.hospital.entity.Staff;
import com.example.hospital.repository.DoctorRepository;
import com.example.hospital.repository.PatientRepository;
import com.example.hospital.repository.StaffRepository;

@Service
public class HospitalService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;

    @Value("${hospital.total-rooms:10}")
    private int totalRooms;

    public HospitalService(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            StaffRepository staffRepository
    ) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
    }

    public List<RoomResponse> getRooms() {
        RoomSnapshot snapshot = buildRoomSnapshot();
        return buildRooms(snapshot.roomAssignments);
    }

    public List<Doctor> getDoctors() {
        return doctorRepository.findAll()
                .stream()
                .sorted(Comparator.comparingInt(Doctor::getId))
                .toList();
    }

    public Doctor addDoctor(Doctor doctor) {
        validateDoctor(doctor);

        if (doctorRepository.existsById(doctor.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor ID already exists."
            );
        }

        doctor.setAvailable(true);
        return doctorRepository.save(doctor);
    }

    public Doctor setDoctorAvailability(int doctorId, boolean available) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Doctor not found."
        ));

        doctor.setAvailable(available);
        return doctorRepository.save(doctor);
    }

    public Patient admitPatient(Patient request) {
        validatePatient(request);

        if (patientRepository.existsById(request.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Patient ID already exists."
            );
        }

        RoomSnapshot snapshot = buildRoomSnapshot();
        int availableRoom = findFirstAvailableRoom(snapshot.roomAssignments);
        if (availableRoom < 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No rooms available."
            );
        }

        request.setAdmitted(true);
        request.setRoomNumber(availableRoom);
        return patientRepository.save(request);
    }

    public void dischargePatient(int patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Patient not found in occupied rooms."
        ));

        if (!patient.isAdmitted() || patient.getRoomNumber() == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Patient not found in occupied rooms."
            );
        }

        patient.setAdmitted(false);
        patient.setRoomNumber(null);
        patientRepository.save(patient);
    }

    public List<StaffResponse> getStaff() {
        return staffRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Staff::getStaffId))
                .map(this::toStaffResponse)
                .toList();
    }

    public StaffResponse checkInStaff(StaffRequest request) {
        int staffId = request.getStaffId();
        String staffName = request.getStaffName() == null
                ? ""
                : request.getStaffName().trim();

        if (staffId <= 0 || staffName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Staff ID and staff name are required."
            );
        }

        Staff staff = staffRepository.findById(staffId).orElseGet(Staff::new);
        staff.setStaffId(staffId);
        staff.setStaffName(staffName);
        staff.setCheckedIn(true);
        return toStaffResponse(staffRepository.save(staff));
    }

    public StaffResponse checkOutStaff(int staffId) {
        if (staffId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Staff ID must be positive."
            );
        }

        Staff staff = staffRepository.findById(staffId).orElse(null);
        if (staff == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Staff member not found."
            );
        }

        staff.setCheckedIn(false);
        return toStaffResponse(staffRepository.save(staff));
    }

    public StatusResponse getStatus() {
        RoomSnapshot snapshot = buildRoomSnapshot();
        int occupiedRooms = snapshot.roomAssignments.size();
        int staffCheckedIn = Math.toIntExact(staffRepository.countByCheckedInTrue());

        StatusResponse status = new StatusResponse();
        status.setTotalRooms(totalRooms);
        status.setOccupiedRooms(occupiedRooms);
        status.setDoctorCount(Math.toIntExact(doctorRepository.count()));
        status.setPatientCount(snapshot.admittedCount);
        status.setStaffCheckedIn(staffCheckedIn);
        status.setOffline(false);
        return status;
    }

    private RoomSnapshot buildRoomSnapshot() {
        List<Patient> admittedPatients = patientRepository.findByAdmittedTrue();
        Map<Integer, Patient> roomAssignments = new LinkedHashMap<>();
        Deque<Patient> unassignedPatients = new ArrayDeque<>();

        for (Patient patient : admittedPatients) {
            Integer roomNumber = patient.getRoomNumber();
            if (roomNumber != null
                    && roomNumber > 0
                    && roomNumber <= totalRooms
                    && !roomAssignments.containsKey(roomNumber)) {
                roomAssignments.put(roomNumber, patient);
            } else {
                unassignedPatients.add(patient);
            }
        }

        List<Patient> updatedPatients = new ArrayList<>();
        for (int roomNumber = 1; roomNumber <= totalRooms; roomNumber += 1) {
            if (roomAssignments.containsKey(roomNumber)) {
                continue;
            }

            Patient patient = unassignedPatients.poll();
            if (patient == null) {
                break;
            }

            patient.setRoomNumber(roomNumber);
            patient.setAdmitted(true);
            roomAssignments.put(roomNumber, patient);
            updatedPatients.add(patient);
        }

        if (!updatedPatients.isEmpty()) {
            patientRepository.saveAll(updatedPatients);
        }

        return new RoomSnapshot(roomAssignments, admittedPatients.size());
    }

    private int findFirstAvailableRoom(Map<Integer, Patient> roomAssignments) {
        for (int roomNumber = 1; roomNumber <= totalRooms; roomNumber += 1) {
            if (!roomAssignments.containsKey(roomNumber)) {
                return roomNumber;
            }
        }
        return -1;
    }

    private List<RoomResponse> buildRooms(Map<Integer, Patient> roomAssignments) {
        List<RoomResponse> rooms = new ArrayList<>();
        for (int roomNumber = 1; roomNumber <= totalRooms; roomNumber += 1) {
            RoomResponse response = new RoomResponse();
            response.setRoomNumber(roomNumber);

            Patient patient = roomAssignments.get(roomNumber);
            response.setOccupied(patient != null);
            if (patient != null) {
                response.setPatientId(patient.getId());
                response.setPatientName(patient.getName());
                response.setDisease(patient.getDisease());
            }

            rooms.add(response);
        }

        return rooms;
    }

    private StaffResponse toStaffResponse(Staff staff) {
        return new StaffResponse(
                staff.getStaffId(),
                staff.getStaffName(),
                staff.isCheckedIn()
        );
    }

    private void validateDoctor(Doctor doctor) {
        if (doctor.getId() <= 0
                || doctor.getName() == null
                || doctor.getName().trim().isBlank()
                || doctor.getSpecialization() == null
                || doctor.getSpecialization().trim().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor ID, name, and specialization are required."
            );
        }
    }

    private void validatePatient(Patient patient) {
        if (patient.getId() <= 0
                || patient.getName() == null
                || patient.getName().trim().isBlank()
                || patient.getDisease() == null
                || patient.getDisease().trim().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Patient ID, name, and disease are required."
            );
        }
    }

    private static class RoomSnapshot {

        private final Map<Integer, Patient> roomAssignments;
        private final int admittedCount;

        private RoomSnapshot(Map<Integer, Patient> roomAssignments, int admittedCount) {
            this.roomAssignments = roomAssignments;
            this.admittedCount = admittedCount;
        }
    }
}
