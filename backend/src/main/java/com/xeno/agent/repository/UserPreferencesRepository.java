package com.xeno.agent.repository;

import com.xeno.agent.model.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for UserPreferences entities
 */
@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    /**
     * Find preferences by user ID
     */
    UserPreferences findByUserId(Long userId);

    /**
     * Check if preferences exist for user
     */
    boolean existsByUserId(Long userId);
}