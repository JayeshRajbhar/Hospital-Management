package com.example.hospital.service;

import com.example.hospital.dto.RoomResponse;
import com.example.hospital.dto.StaffRequest;
import com.example.hospital.dto.StaffResponse;
import com.example.hospital.dto.StatusResponse;
import com.example.hospital.entity.Doctor;
import com.example.hospital.entity.Patient;
import com.example.hospital.repository.DoctorRepository;
import com.example.hospital.repository.PatientRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HospitalService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Value("${hospital.total-rooms:10}")
    private int totalRooms;

    private final List<RoomSlot> rooms = new ArrayList<>();
    private final Map<Integer, StaffResponse> staffMap = new LinkedHashMap<>();

    public HospitalService(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository
    ) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @PostConstruct
    public void initRooms() {
        rooms.clear();
        for (int roomNumber = 1; roomNumber <= totalRooms; roomNumber += 1) {
            rooms.add(new RoomSlot(roomNumber));
        }
    }

    public List<RoomResponse> getRooms() {
        return rooms.stream()
                .map(this::toRoomResponse)
                .toList();
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

        RoomSlot emptyRoom = rooms.stream()
                .filter(room -> room.patient == null)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "No rooms available."
                ));

        request.setAdmitted(true);
        Patient savedPatient = patientRepository.save(request);
        emptyRoom.patient = savedPatient;

        return savedPatient;
    }

    public void dischargePatient(int patientId) {
        RoomSlot occupiedRoom = rooms.stream()
                .filter(room -> room.patient != null && room.patient.getId() == patientId)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient not found in occupied rooms."
                ));

        patientRepository.findById(patientId).ifPresent(patient -> {
            patient.setAdmitted(false);
            patientRepository.save(patient);
        });

        occupiedRoom.patient = null;
    }

    public List<StaffResponse> getStaff() {
        return staffMap.values().stream()
                .sorted(Comparator.comparingInt(StaffResponse::getStaffId))
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

        StaffResponse staff = new StaffResponse(staffId, staffName, true);
        staffMap.put(staffId, staff);
        return staff;
    }

    public StaffResponse checkOutStaff(int staffId) {
        if (staffId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Staff ID must be positive."
            );
        }

        StaffResponse staff = staffMap.get(staffId);
        if (staff == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Staff member not found."
            );
        }

        staff.setCheckedIn(false);
        staffMap.put(staffId, staff);
        return staff;
    }

    public StatusResponse getStatus() {
        int occupiedRooms = (int) rooms.stream()
                .filter(room -> room.patient != null)
                .count();

        int staffCheckedIn = (int) staffMap.values().stream()
                .filter(StaffResponse::isCheckedIn)
                .count();

        StatusResponse status = new StatusResponse();
        status.setTotalRooms(rooms.size());
        status.setOccupiedRooms(occupiedRooms);
        status.setDoctorCount(Math.toIntExact(doctorRepository.count()));
        status.setPatientCount(occupiedRooms);
        status.setStaffCheckedIn(staffCheckedIn);
        status.setOffline(false);
        return status;
    }

    private RoomResponse toRoomResponse(RoomSlot room) {
        RoomResponse response = new RoomResponse();
        response.setRoomNumber(room.roomNumber);
        response.setOccupied(room.patient != null);

        if (room.patient != null) {
            response.setPatientId(room.patient.getId());
            response.setPatientName(room.patient.getName());
            response.setDisease(room.patient.getDisease());
        }

        return response;
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

    private static class RoomSlot {
        private final int roomNumber;
        private Patient patient;

        private RoomSlot(int roomNumber) {
            this.roomNumber = roomNumber;
        }
    }
}
