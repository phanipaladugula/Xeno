package com.xeno.agent.repository;

import com.xeno.agent.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Message entities
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Find messages by chat ID ordered by timestamp
     */
    List<Message> findByChatIdOrderByTimestampAsc(Long chatId);

    /**
     * Delete messages by chat ID
     */
    void deleteByChatId(Long chatId);
}