package com.xeno.agent.service;

import com.xeno.agent.model.Task;
import com.xeno.agent.model.User;
import com.xeno.agent.repository.TaskRepository;
import com.xeno.agent.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for task operations
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new task
     */
    public Task createTask(Long userId, Task task) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        task.setUser(user);
        return taskRepository.save(task);
    }

    /**
     * Update an existing task
     */
    public Task updateTask(Long taskId, Long userId, Task taskDetails) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        if (taskDetails.getTitle() != null) {
            task.setTitle(taskDetails.getTitle());
        }
        if (taskDetails.getDescription() != null) {
            task.setDescription(taskDetails.getDescription());
        }
        if (taskDetails.getStatus() != null) {
            task.setStatus(taskDetails.getStatus());
        }
        if (taskDetails.getPriority() != null) {
            task.setPriority(taskDetails.getPriority());
        }
        if (taskDetails.getDueDate() != null) {
            task.setDueDate(taskDetails.getDueDate());
        }
        if (taskDetails.getCompleted() != null) {
            task.setCompleted(taskDetails.getCompleted());
        }

        return taskRepository.save(task);
    }

    /**
     * Delete a task
     */
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }
        taskRepository.delete(task);
    }

    /**
     * Get all tasks for a user
     */
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Mark a task as complete
     */
    public Task markComplete(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        task.setCompleted(true);
        return taskRepository.save(task);
    }

    /**
     * Get tasks by status
     */
    public List<Task> getTasksByStatus(Long userId, Task.TaskStatus status) {
        return taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }

    /**
     * Get tasks by priority
     */
    public List<Task> getTasksByPriority(Long userId, Task.TaskPriority priority) {
        return taskRepository.findByUserIdAndPriorityOrderByCreatedAtDesc(userId, priority);
    }

    /**
     * Get a specific task by ID
     */
    public Task getTaskById(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }
        return task;
    }
}