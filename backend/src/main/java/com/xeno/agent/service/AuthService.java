package com.xeno.agent.service;

import com.xeno.agent.model.User;
import com.xeno.agent.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service for authentication operations
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Register a new user
     */
    public User registerUser(String username, String password, String email) {
        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(password);

        // Create new user
        User user = new User(username, encodedPassword, email);
        user.setRole("USER");

        // Save user
        User savedUser = userRepository.save(user);
        return savedUser;
    }

    /**
     * Login user
     */
    public Map<String, Object> login(String username, String password) {
        // Find user by username
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOptional.get();

        // Check password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("token", generateToken(user));

        return response;
    }

    /**
     * Generate simple token (in real app, use JWT)
     */
    private String generateToken(User user) {
        return "token-" + user.getId() + "-" + System.currentTimeMillis();
    }

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}