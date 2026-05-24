package com.example.hospital.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hospital.entity.Patient;
import com.example.hospital.service.PatientService;

@RestController
@RequestMapping("/patients")
@CrossOrigin(origins = {"http://localhost:3000", "https://hospital-management-five-pearl.vercel.app"})
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @PostMapping
    public Patient addPatient(
            @RequestBody Patient patient) {

        return service.savePatient(patient);
    }

    @GetMapping
    public List<Patient> getPatients() {
        return service.getAllPatients();
    }
}