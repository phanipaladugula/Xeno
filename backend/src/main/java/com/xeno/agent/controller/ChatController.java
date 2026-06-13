package com.xeno.agent.controller;

import com.xeno.agent.model.Chat;
import com.xeno.agent.model.Message;
import com.xeno.agent.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for chat endpoints
 */
@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Get user ID from request (simple authentication)
     */
    private Long getUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null) {
            throw new RuntimeException("User not authenticated");
        }
        return Long.parseLong(userIdHeader);
    }

    /**
     * Get all chats for the user
     */
    @GetMapping
    public ResponseEntity<?> getChats(HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            List<Chat> chats = chatService.getChatsByUser(userId);
            return ResponseEntity.ok(chats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a new chat
     */
    @PostMapping
    public ResponseEntity<?> createChat(@RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            String title = body.get("title");
            if (title == null || title.trim().isEmpty()) {
                title = "New Chat";
            }
            Chat chat = chatService.createChat(userId, title);
            return ResponseEntity.status(HttpStatus.CREATED).body(chat);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get messages for a chat
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            List<Message> messages = chatService.getMessagesByChat(id, userId);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Send a message to a chat
     */
    @PostMapping("/{id}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            String content = body.get("content");
            String sender = body.get("sender");
            Boolean isAiResponse = Boolean.parseBoolean(body.getOrDefault("isAiResponse", "false"));

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message content is required"));
            }

            Message message = chatService.addMessage(id, userId, content, sender, isAiResponse);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a chat
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChat(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            chatService.deleteChat(id, userId);
            return ResponseEntity.ok(Map.of("message", "Chat deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}