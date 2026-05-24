package com.example.hospital.dto;

public class StaffResponse {

    private int staffId;
    private String staffName;
    private boolean checkedIn;

    public StaffResponse() {
    }

    public StaffResponse(int staffId, String staffName, boolean checkedIn) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.checkedIn = checkedIn;
    }

    public int getStaffId() {
        return staffId;
    }

    public void setStaffId(int staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public boolean isCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(boolean checkedIn) {
        this.checkedIn = checkedIn;
    }
}
