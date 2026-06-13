package com.xeno.agent.controller;

import com.xeno.agent.XenoAgentApplication;
import com.xeno.agent.dto.LoginRequest;
import com.xeno.agent.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for AuthController
 */
@SpringBootTest(
    classes = XenoAgentApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureWebMvc
@ActiveProfiles("test")
public class AuthControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/auth";
    }

    @Test
    void testRegister_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest("testuser123", "password123", "test123@example.com");

        // Act
        ResponseEntity<?> response = restTemplate.postForEntity(
                baseUrl + "/register",
                request,
                Object.class
        );

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testRegister_MissingFields() {
        // Arrange
        RegisterRequest request = new RegisterRequest("", "pass", "test@example.com");

        // Act
        ResponseEntity<?> response = restTemplate.postForEntity(
                baseUrl + "/register",
                request,
                Object.class
        );

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testLogin_Success() {
        // First register a user
        RegisterRequest registerRequest = new RegisterRequest("loginuser", "password123", "loginuser@example.com");
        restTemplate.postForEntity(baseUrl + "/register", registerRequest, Object.class);

        // Then login
        LoginRequest loginRequest = new LoginRequest("loginuser", "password123");

        // Act
        ResponseEntity<?> response = restTemplate.postForEntity(
                baseUrl + "/login",
                loginRequest,
                Object.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testLogin_InvalidCredentials() {
        // Arrange
        LoginRequest request = new LoginRequest("nonexistent", "wrongpassword");

        // Act
        ResponseEntity<?> response = restTemplate.postForEntity(
                baseUrl + "/login",
                request,
                Object.class
        );

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}