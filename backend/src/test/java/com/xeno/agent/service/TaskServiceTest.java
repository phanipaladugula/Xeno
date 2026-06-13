package com.xeno.agent.service;

import com.xeno.agent.model.Task;
import com.xeno.agent.model.User;
import com.xeno.agent.repository.TaskRepository;
import com.xeno.agent.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaskService
 */
@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "password123", "test@example.com");
        testUser.setId(1L);

        testTask = new Task(testUser, "Test Task");
        testTask.setId(1L);
        testTask.setStatus(Task.TaskStatus.TODO);
        testTask.setPriority(Task.TaskPriority.MEDIUM);
    }

    @Test
    void testCreateTask_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.createTask(1L, testTask);

        // Assert
        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void testCreateTask_UserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
            taskService.createTask(999L, testTask)
        );
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void testUpdateTask_Success() {
        // Arrange
        Task updatedDetails = new Task();
        updatedDetails.setTitle("Updated Title");
        updatedDetails.setDescription("Updated description");

        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(testTask);
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.updateTask(1L, 1L, updatedDetails);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Title", result.getTitle());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void testUpdateTask_NotFound() {
        // Arrange
        when(taskRepository.findByIdAndUserId(999L, 1L)).thenReturn(null);

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
            taskService.updateTask(999L, 1L, testTask)
        );
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void testDeleteTask_Success() {
        // Arrange
        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(testTask);
        doNothing().when(taskRepository).delete(any(Task.class));

        // Act
        taskService.deleteTask(1L, 1L);

        // Assert
        verify(taskRepository).delete(testTask);
    }

    @Test
    void testDeleteTask_NotFound() {
        // Arrange
        when(taskRepository.findByIdAndUserId(999L, 1L)).thenReturn(null);

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
            taskService.deleteTask(999L, 1L)
        );
        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    void testMarkComplete_Success() {
        // Arrange
        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(testTask);
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Task result = taskService.markComplete(1L, 1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.getCompleted());
        assertEquals(Task.TaskStatus.COMPLETED, result.getStatus());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void testGetTasksByUser() {
        // Arrange
        List<Task> expectedTasks = List.of(testTask);
        when(taskRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(expectedTasks);

        // Act
        List<Task> result = taskService.getTasksByUser(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetTasksByStatus() {
        // Arrange
        List<Task> expectedTasks = List.of(testTask);
        when(taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(1L, Task.TaskStatus.TODO))
                .thenReturn(expectedTasks);

        // Act
        List<Task> result = taskService.getTasksByStatus(1L, Task.TaskStatus.TODO);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetTasksByPriority() {
        // Arrange
        List<Task> expectedTasks = List.of(testTask);
        when(taskRepository.findByUserIdAndPriorityOrderByCreatedAtDesc(1L, Task.TaskPriority.MEDIUM))
                .thenReturn(expectedTasks);

        // Act
        List<Task> result = taskService.getTasksByPriority(1L, Task.TaskPriority.MEDIUM);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }
}