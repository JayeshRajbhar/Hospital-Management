package com.example.hospital.repository;

import com.example.hospital.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<Staff, Integer> {

    long countByCheckedInTrue();
}
