package com.xeno.agent.controller;

import com.xeno.agent.model.Message;
import com.xeno.agent.service.AgentService;
import com.xeno.agent.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for AI agent operations
 */
@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "http://localhost:5173")
public class AgentController {

    private final AgentService agentService;
    private final ChatService chatService;

    public AgentController(AgentService agentService, ChatService chatService) {
        this.agentService = agentService;
        this.chatService = chatService;
    }

    /**
     * Get user ID from request
     */
    private Long getUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null) {
            throw new RuntimeException("User not authenticated");
        }
        return Long.parseLong(userIdHeader);
    }

    /**
     * Process a message with the AI agent
     */
    @PostMapping("/chat")
    public ResponseEntity<?> processMessage(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try {
            Long userId = getUserId(request);
            String chatIdStr = body.get("chatId");
            String content = body.get("content");

            if (chatIdStr == null || content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "chatId and content are required"));
            }

            Long chatId = Long.parseLong(chatIdStr);

            // Get chat history
            List<Message> history = chatService.getMessagesByChat(chatId, userId);

            // Get AI response
            String aiResponse = agentService.processMessage(content, history);

            // Save AI response to chat
            Message aiMessage = chatService.addMessage(chatId, userId, aiResponse, "ai", true);

            return ResponseEntity.ok(aiMessage);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if agent is configured
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        boolean configured = agentService.isConfigured();
        return ResponseEntity.ok(Map.of(
                "configured", configured,
                "message", configured ? "Agent is ready" : "Please configure API keys"
        ));
    }
}