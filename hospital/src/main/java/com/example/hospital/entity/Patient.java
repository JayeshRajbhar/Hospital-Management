package com.example.hospital.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    private int id;

    private String name;

    private String disease;

    private boolean admitted;

    private Integer roomNumber;

    public Patient() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisease() {
        return disease;
    }

    public void setDisease(String disease) {
        this.disease = disease;
    }

    public boolean isAdmitted() {
        return admitted;
    }

    public void setAdmitted(boolean admitted) {
        this.admitted = admitted;
    }

    public Integer getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(Integer roomNumber) {
        this.roomNumber = roomNumber;
    }
}
