package com.xeno.agent.service;

import com.xeno.agent.model.Chat;
import com.xeno.agent.model.Message;
import com.xeno.agent.model.User;
import com.xeno.agent.repository.ChatParticipantRepository;
import com.xeno.agent.repository.ChatRepository;
import com.xeno.agent.repository.MessageRepository;
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
 * Unit tests for ChatService
 */
@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatParticipantRepository chatParticipantRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatService chatService;

    private User testUser;
    private Chat testChat;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "password123", "test@example.com");
        testUser.setId(1L);

        testChat = new Chat(testUser, "Test Chat");
        testChat.setId(1L);
    }

    @Test
    void testCreateChat_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(chatRepository.save(any(Chat.class))).thenReturn(testChat);

        // Act
        Chat result = chatService.createChat(1L, "Test Chat");

        // Assert
        assertNotNull(result);
        assertEquals("Test Chat", result.getTitle());
        verify(chatRepository).save(any(Chat.class));
    }

    @Test
    void testCreateChat_UserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
            chatService.createChat(999L, "Test Chat")
        );
        verify(chatRepository, never()).save(any(Chat.class));
    }

    @Test
    void testGetChatsByUser() {
        // Arrange
        List<Chat> expectedChats = List.of(testChat);
        when(chatRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(expectedChats);

        // Act
        List<Chat> result = chatService.getChatsByUser(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetChatById_Success() {
        // Arrange
        when(chatRepository.findByIdAndUserId(1L, 1L)).thenReturn(testChat);

        // Act
        Chat result = chatService.getChatById(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals("Test Chat", result.getTitle());
    }

    @Test
    void testGetChatById_NotFound() {
        // Arrange
        when(chatRepository.findByIdAndUserId(999L, 1L)).thenReturn(null);

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
            chatService.getChatById(999L, 1L)
        );
    }

    @Test
    void testAddMessage_Success() {
        // Arrange
        Message testMessage = new Message(testChat, "Hello", "user");
        testMessage.setId(1L);

        when(chatRepository.findByIdAndUserId(1L, 1L)).thenReturn(testChat);
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

        // Act
        Message result = chatService.addMessage(1L, 1L, "Hello", "user", false);

        // Assert
        assertNotNull(result);
        assertEquals("Hello", result.getContent());
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void testDeleteChat_Success() {
        // Arrange
        when(chatRepository.findByIdAndUserId(1L, 1L)).thenReturn(testChat);
        doNothing().when(messageRepository).deleteByChatId(1L);
        doNothing().when(chatRepository).delete(any(Chat.class));

        // Act
        chatService.deleteChat(1L, 1L);

        // Assert
        verify(messageRepository).deleteByChatId(1L);
        verify(chatRepository).delete(testChat);
    }
}