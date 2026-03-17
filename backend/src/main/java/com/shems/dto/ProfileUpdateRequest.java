package com.shems.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String profilePhoto;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String dateOfBirth;
    private String occupation;
    private String bio;
}
