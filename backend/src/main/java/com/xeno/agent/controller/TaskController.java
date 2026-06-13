package com.xeno.agent.controller;

import com.xeno.agent.model.Task;
import com.xeno.agent.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for task endpoints
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
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
     * Get all tasks for the user
     */
    @GetMapping
    public ResponseEntity<?> getTasks(HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            List<Task> tasks = taskService.getTasksByUser(userId);
            return ResponseEntity.ok(tasks);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a new task
     */
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task, HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            Task createdTask = taskService.createTask(userId, task);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update a task
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody Task taskDetails,
            HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            Task updatedTask = taskService.updateTask(id, userId, taskDetails);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            taskService.deleteTask(id, userId);
            return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark a task as complete
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> markComplete(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            Task task = taskService.markComplete(id, userId);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get tasks by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTasksByStatus(
            @PathVariable String status,
            HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
            List<Task> tasks = taskService.getTasksByStatus(userId, taskStatus);
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get tasks by priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<?> getTasksByPriority(
            @PathVariable String priority,
            HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            Task.TaskPriority taskPriority = Task.TaskPriority.valueOf(priority.toUpperCase());
            List<Task> tasks = taskService.getTasksByPriority(userId, taskPriority);
            return ResponseEntity.ok(tasks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid priority"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }
}