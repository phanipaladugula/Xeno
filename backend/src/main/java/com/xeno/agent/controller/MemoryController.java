package com.xeno.agent.controller;

import com.xeno.agent.model.User;
import com.xeno.agent.model.UserPreferences;
import com.xeno.agent.repository.UserRepository;
import com.xeno.agent.service.MemoryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for memory operations
 */
@RestController
@RequestMapping("/api/memory")
@CrossOrigin(origins = "http://localhost:5173")
public class MemoryController {

    private final MemoryService memoryService;
    private final UserRepository userRepository;

    public MemoryController(MemoryService memoryService, UserRepository userRepository) {
        this.memoryService = memoryService;
        this.userRepository = userRepository;
    }

    /**
     * Get user ID from request
     */
    private Long getUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null) {
            throw new RuntimeException("User not authenticated");
        }
        return Long.parseLong(userIdHeader);
    }

    /**
     * Get user preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserPreferences preferences = memoryService.getUserPreferences(user);
            return ResponseEntity.ok(preferences);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update user preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @RequestBody UserPreferences preferences,
            HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            UserPreferences updated = memoryService.updateUserPreferences(userId, preferences);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get memory context
     */
    @GetMapping("/context")
    public ResponseEntity<?> getContext(HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            Map<String, Object> context = memoryService.getContextForUser(userId);
            return ResponseEntity.ok(context);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get memory statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            Map<String, Object> stats = memoryService.getMemoryStats(userId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}