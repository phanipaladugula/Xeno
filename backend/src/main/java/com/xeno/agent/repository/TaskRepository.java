package com.xeno.agent.repository;

import com.xeno.agent.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Task entities
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find tasks by user ID ordered by created date
     */
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find tasks by user ID and status
     */
    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Task.TaskStatus status);

    /**
     * Find tasks by user ID and priority
     */
    List<Task> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, Task.TaskPriority priority);

    /**
     * Find tasks by user ID and completion status
     */
    List<Task> findByUserIdAndCompletedOrderByCreatedAtDesc(Long userId, Boolean completed);

    /**
     * Find task by ID and user ID
     */
    Task findByIdAndUserId(Long taskId, Long userId);
}