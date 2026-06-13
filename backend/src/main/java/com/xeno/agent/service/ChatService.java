package com.xeno.agent.service;

import com.xeno.agent.model.Chat;
import com.xeno.agent.model.ChatParticipant;
import com.xeno.agent.model.Message;
import com.xeno.agent.model.User;
import com.xeno.agent.repository.ChatParticipantRepository;
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
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;

    public ChatService(
            ChatRepository chatRepository,
            MessageRepository messageRepository,
            ChatParticipantRepository chatParticipantRepository,
            UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.chatParticipantRepository = chatParticipantRepository;
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
     * Create a new group chat
     */
    public Chat createGroupChat(Long userId, String title) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chat chat = new Chat(user, title);
        chat.setType(Chat.ChatType.GROUP);
        chat = chatRepository.save(chat);

        // Add creator as admin
        ChatParticipant participant = new ChatParticipant(chat, user, ChatParticipant.ParticipantRole.ADMIN);
        chatParticipantRepository.save(participant);

        return chat;
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
        chatParticipantRepository.deleteByChatId(chatId);
        chatRepository.delete(chat);
    }

    /**
     * Add a participant to a group chat
     */
    public ChatParticipant addParticipant(Long chatId, Long requestorId, Long userIdToAdd) {
        Chat chat = getChatById(chatId, requestorId);

        if (chat.getType() != Chat.ChatType.GROUP) {
            throw new RuntimeException("Only group chats can have multiple participants");
        }

        // Check if user is already in the chat
        if (chatParticipantRepository.existsByChatIdAndUserId(chatId, userIdToAdd)) {
            throw new RuntimeException("User is already in the chat");
        }

        User userToAdd = userRepository.findById(userIdToAdd)
                .orElseThrow(() -> new RuntimeException("User to add not found"));

        ChatParticipant participant = new ChatParticipant(chat, userToAdd);
        return chatParticipantRepository.save(participant);
    }

    /**
     * Remove a participant from a group chat
     */
    public void removeParticipant(Long chatId, Long requestorId, Long userIdToRemove) {
        Chat chat = getChatById(chatId, requestorId);

        if (chat.getType() != Chat.ChatType.GROUP) {
            throw new RuntimeException("Only group chats can have participants");
        }

        chatParticipantRepository.deleteByChatIdAndUserId(chatId, userIdToRemove);
    }

    /**
     * Get all participants in a chat
     */
    public List<ChatParticipant> getParticipants(Long chatId, Long requestorId) {
        Chat chat = getChatById(chatId, requestorId);
        return chatParticipantRepository.findByChatId(chatId);
    }
}