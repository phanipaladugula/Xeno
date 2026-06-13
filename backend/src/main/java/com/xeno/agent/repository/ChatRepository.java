package com.xeno.agent.repository;

import com.xeno.agent.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Chat entities
 */
@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    /**
     * Find chats by user ID
     */
    List<Chat> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find chat by ID and user ID
     */
    Chat findByIdAndUserId(Long chatId, Long userId);
}