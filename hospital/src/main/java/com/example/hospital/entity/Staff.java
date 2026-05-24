package com.example.hospital.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    private int staffId;

    private String staffName;

    private boolean checkedIn;

    public Staff() {
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
