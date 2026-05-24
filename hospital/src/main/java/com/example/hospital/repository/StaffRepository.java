package com.example.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospital.entity.Staff;

public interface StaffRepository extends JpaRepository<Staff, Integer> {

    long countByCheckedInTrue();
}
