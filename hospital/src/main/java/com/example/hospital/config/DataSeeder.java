package com.example.hospital.config;

import com.example.hospital.entity.AppUser;
import com.example.hospital.entity.Doctor;
import com.example.hospital.entity.Patient;
import com.example.hospital.entity.Staff;
import com.example.hospital.repository.AppUserRepository;
import com.example.hospital.repository.DoctorRepository;
import com.example.hospital.repository.PatientRepository;
import com.example.hospital.repository.StaffRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            AppUserRepository userRepository,
            DoctorRepository doctorRepository,
            StaffRepository staffRepository,
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed users
        if (userRepository.count() == 0) {
            AppUser defaultUser = new AppUser();
            defaultUser.setUsername("admin");
            defaultUser.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(defaultUser);
            System.out.println("Seeded sample user: admin / admin123");
        }

        // Seed doctors
        if (doctorRepository.count() == 0) {
            Doctor doc1 = new Doctor();
            doc1.setId(1);
            doc1.setName("Dr. Arvind Patel");
            doc1.setSpecialization("Cardiology");
            doc1.setAvailable(true);

            Doctor doc2 = new Doctor();
            doc2.setId(2);
            doc2.setName("Dr. Sneha Rao");
            doc2.setSpecialization("Pediatrics");
            doc2.setAvailable(true);

            Doctor doc3 = new Doctor();
            doc3.setId(3);
            doc3.setName("Dr. Manoj Sharma");
            doc3.setSpecialization("Neurology");
            doc3.setAvailable(false);

            Doctor doc4 = new Doctor();
            doc4.setId(4);
            doc4.setName("Dr. Priya Nair");
            doc4.setSpecialization("Orthopedics");
            doc4.setAvailable(true);

            Doctor doc5 = new Doctor();
            doc5.setId(5);
            doc5.setName("Dr. Rajesh Kumar");
            doc5.setSpecialization("General Medicine");
            doc5.setAvailable(true);

            doctorRepository.saveAll(List.of(doc1, doc2, doc3, doc4, doc5));
            System.out.println("Seeded sample doctors");
        }

        // Seed staff
        if (staffRepository.count() == 0) {
            Staff s1 = new Staff();
            s1.setStaffId(501);
            s1.setStaffName("Ramesh Kumar");
            s1.setCheckedIn(true);

            Staff s2 = new Staff();
            s2.setStaffId(502);
            s2.setStaffName("Sunita Deshmukh");
            s2.setCheckedIn(true);

            Staff s3 = new Staff();
            s3.setStaffId(503);
            s3.setStaffName("Amit Verma");
            s3.setCheckedIn(false);

            Staff s4 = new Staff();
            s4.setStaffId(504);
            s4.setStaffName("Kavita Reddy");
            s4.setCheckedIn(true);

            Staff s5 = new Staff();
            s5.setStaffId(505);
            s5.setStaffName("Vikram Malhotra");
            s5.setCheckedIn(false);

            staffRepository.saveAll(List.of(s1, s2, s3, s4, s5));
            System.out.println("Seeded sample staff members");
        }

        // Seed patients
        if (patientRepository.count() == 0) {
            Patient p1 = new Patient();
            p1.setId(101);
            p1.setName("Rohan Gupta");
            p1.setDisease("Migraine");
            p1.setRoomNumber(1);
            p1.setAdmitted(true);

            Patient p2 = new Patient();
            p2.setId(102);
            p2.setName("Meera Sen");
            p2.setDisease("Pneumonia");
            p2.setRoomNumber(2);
            p2.setAdmitted(true);

            Patient p3 = new Patient();
            p3.setId(103);
            p3.setName("Anil Joshi");
            p3.setDisease("Appendicitis");
            p3.setRoomNumber(3);
            p3.setAdmitted(true);

            patientRepository.saveAll(List.of(p1, p2, p3));
            System.out.println("Seeded sample patients");
        }
    }
}
