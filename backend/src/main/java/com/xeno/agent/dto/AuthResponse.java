package com.xeno.agent.dto;

/**
 * DTO for authentication response
 */
public class AuthResponse {

    private Long userId;
    private String username;
    private String email;
    private String role;
    private String token;

    // Default constructor
    public AuthResponse() {
    }

    // Constructor with parameters
    public AuthResponse(Long userId, String username, String email, String role, String token) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}