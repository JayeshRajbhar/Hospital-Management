package com.example.hospital.dto;

public class StatusResponse {

    private int totalRooms;
    private int occupiedRooms;
    private int doctorCount;
    private int patientCount;
    private int staffCheckedIn;
    private boolean offline;

    public StatusResponse() {
    }

    public int getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(int totalRooms) {
        this.totalRooms = totalRooms;
    }

    public int getOccupiedRooms() {
        return occupiedRooms;
    }

    public void setOccupiedRooms(int occupiedRooms) {
        this.occupiedRooms = occupiedRooms;
    }

    public int getDoctorCount() {
        return doctorCount;
    }

    public void setDoctorCount(int doctorCount) {
        this.doctorCount = doctorCount;
    }

    public int getPatientCount() {
        return patientCount;
    }

    public void setPatientCount(int patientCount) {
        this.patientCount = patientCount;
    }

    public int getStaffCheckedIn() {
        return staffCheckedIn;
    }

    public void setStaffCheckedIn(int staffCheckedIn) {
        this.staffCheckedIn = staffCheckedIn;
    }

    public boolean isOffline() {
        return offline;
    }

    public void setOffline(boolean offline) {
        this.offline = offline;
    }
}
