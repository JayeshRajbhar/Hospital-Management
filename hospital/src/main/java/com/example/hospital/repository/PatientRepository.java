package com.example.hospital.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospital.entity.Patient;

public interface PatientRepository
        extends JpaRepository<Patient, Integer> {

    List<Patient> findByAdmittedTrue();

    long countByAdmittedTrue();
}
