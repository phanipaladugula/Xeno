package com.xeno.agent.service;

import com.xeno.agent.model.Chat;
import com.xeno.agent.model.Message;
import com.xeno.agent.model.User;
import com.xeno.agent.repository.ChatRepository;
import com.xeno.agent.repository.MessageRepository;
import com.xeno.agent.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for chat operations
 */
@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(
            ChatRepository chatRepository,
            MessageRepository messageRepository,
            UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new chat for user
     */
    public Chat createChat(Long userId, String title) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chat chat = new Chat(user, title);
        return chatRepository.save(chat);
    }

    /**
     * Get all chats for a user
     */
    public List<Chat> getChatsByUser(Long userId) {
        return chatRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get a specific chat by ID
     */
    public Chat getChatById(Long chatId, Long userId) {
        Chat chat = chatRepository.findByIdAndUserId(chatId, userId);
        if (chat == null) {
            throw new RuntimeException("Chat not found");
        }
        return chat;
    }

    /**
     * Add a message to a chat
     */
    public Message addMessage(Long chatId, Long userId, String content, String sender, Boolean isAiResponse) {
        Chat chat = getChatById(chatId, userId);

        Message message = new Message(chat, content, sender, isAiResponse);
        return messageRepository.save(message);
    }

    /**
     * Get all messages for a chat
     */
    public List<Message> getMessagesByChat(Long chatId, Long userId) {
        Chat chat = getChatById(chatId, userId);
        return messageRepository.findByChatIdOrderByTimestampAsc(chatId);
    }

    /**
     * Delete a chat
     */
    public void deleteChat(Long chatId, Long userId) {
        Chat chat = getChatById(chatId, userId);
        messageRepository.deleteByChatId(chatId);
        chatRepository.delete(chat);
    }
}