package com.xeno.agent.repository;

import com.xeno.agent.model.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ChatParticipant entities
 */
@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    /**
     * Find all participants in a chat
     */
    List<ChatParticipant> findByChatId(Long chatId);

    /**
     * Find all chats for a user
     */
    List<ChatParticipant> findByUserId(Long userId);

    /**
     * Find a participant by chat and user
     */
    ChatParticipant findByChatIdAndUserId(Long chatId, Long userId);

    /**
     * Check if user is in a chat
     */
    boolean existsByChatIdAndUserId(Long chatId, Long userId);

    /**
     * Delete all participants from a chat
     */
    void deleteByChatId(Long chatId);

    /**
     * Remove a participant from a chat
     */
    void deleteByChatIdAndUserId(Long chatId, Long userId);
}