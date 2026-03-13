package com.shems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UserResponse user;

    // explicit getters to satisfy IDEs that might not process Lombok properly
    public String getToken() {
        return token;
    }

    public UserResponse getUser() {
        return user;
    }

    // lombok still generates setters and other methods
}
