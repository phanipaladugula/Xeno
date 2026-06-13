package com.xeno.agent.controller;

import com.xeno.agent.model.Message;
import com.xeno.agent.service.AgentService;
import com.xeno.agent.service.ApifyService;
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
    private final ApifyService apifyService;

    public AgentController(
            AgentService agentService,
            ChatService chatService,
            ApifyService apifyService) {
        this.agentService = agentService;
        this.chatService = chatService;
        this.apifyService = apifyService;
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
        boolean llmConfigured = agentService.isConfigured();
        boolean apifyConfigured = apifyService.isConfigured();

        return ResponseEntity.ok(Map.of(
                "configured", llmConfigured && apifyConfigured,
                "llmConfigured", llmConfigured,
                "apifyConfigured", apifyConfigured,
                "message", llmConfigured && apifyConfigured ? "Agent is fully ready" : "Please configure API keys"
        ));
    }

    /**
     * Perform web search
     */
    @PostMapping("/search")
    public ResponseEntity<?> webSearch(@RequestBody Map<String, String> body) {
        try {
            String query = body.get("query");
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "query is required"));
            }

            Map<String, Object> results = apifyService.searchWeb(query);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Extract content from URL
     */
    @PostMapping("/extract")
    public ResponseEntity<?> extractContent(@RequestBody Map<String, String> body) {
        try {
            String url = body.get("url");
            if (url == null || url.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "url is required"));
            }

            Map<String, Object> content = apifyService.extractContent(url);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}