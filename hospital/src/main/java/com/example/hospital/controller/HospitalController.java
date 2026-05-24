package com.example.hospital.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.hospital.dto.AvailabilityRequest;
import com.example.hospital.dto.RoomResponse;
import com.example.hospital.dto.StaffRequest;
import com.example.hospital.dto.StaffResponse;
import com.example.hospital.dto.StatusResponse;
import com.example.hospital.entity.Doctor;
import com.example.hospital.entity.Patient;
import com.example.hospital.service.HospitalService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "https://hospital-management-five-pearl.vercel.app"})
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping("/status")
    public StatusResponse getStatus() {
        return hospitalService.getStatus();
    }

    @GetMapping("/rooms")
    public List<RoomResponse> getRooms() {
        return hospitalService.getRooms();
    }

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return hospitalService.getDoctors();
    }

    @PostMapping("/doctors")
    @ResponseStatus(HttpStatus.CREATED)
    public Doctor addDoctor(@RequestBody Doctor doctor) {
        return hospitalService.addDoctor(doctor);
    }

    @PatchMapping("/doctors/{doctorId}/availability")
    public Doctor updateDoctorAvailability(
            @PathVariable int doctorId,
            @RequestBody AvailabilityRequest request
    ) {
        if (request.getAvailable() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Field 'available' is required."
            );
        }
        return hospitalService.setDoctorAvailability(doctorId, request.getAvailable());
    }

    @PostMapping("/patients/admit")
    @ResponseStatus(HttpStatus.CREATED)
    public Patient admitPatient(@RequestBody Patient patient) {
        return hospitalService.admitPatient(patient);
    }

    @PostMapping("/patients/discharge/{patientId}")
    public Map<String, String> dischargePatient(@PathVariable int patientId) {
        hospitalService.dischargePatient(patientId);
        return Map.of("message", "Patient discharged.");
    }

    @GetMapping("/staff")
    public List<StaffResponse> getStaff() {
        return hospitalService.getStaff();
    }

    @PostMapping("/staff/checkin")
    public StaffResponse checkInStaff(@RequestBody StaffRequest request) {
        return hospitalService.checkInStaff(request);
    }

    @PostMapping("/staff/checkout/{staffId}")
    public StaffResponse checkOutStaff(@PathVariable int staffId) {
        return hospitalService.checkOutStaff(staffId);
    }
}
