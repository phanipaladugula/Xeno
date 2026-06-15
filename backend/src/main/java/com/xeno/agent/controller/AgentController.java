package com.xeno.agent.controller;

import com.xeno.agent.service.AIAgentService;
import com.xeno.agent.service.CampaignService;
import com.xeno.agent.service.CustomerService;
import com.xeno.agent.service.LLMService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for AI agent chat and CRM operations
 */
@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = {"https://xeno-sigma-three.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:4173", "http://localhost:5178"})
public class AgentController {

    private final AIAgentService agentService;
    private final CustomerService customerService;
    private final CampaignService campaignService;
    private final LLMService llmService;

    public AgentController(AIAgentService agentService,
                           CustomerService customerService,
                           CampaignService campaignService,
                           LLMService llmService) {
        this.agentService = agentService;
        this.customerService = customerService;
        this.campaignService = campaignService;
        this.llmService = llmService;
    }

    /**
     * Process a conversational message with AI
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body) {
        try {
            String content = (String) body.get("content");
            List<Map<String, String>> history = (List<Map<String, String>>) body.getOrDefault("history", new ArrayList<>());

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "content is required"));
            }

            String response = agentService.processAgentRequest(content, history);
            return ResponseEntity.ok(Map.of("response", response, "role", "assistant"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get dashboard stats (combined customer + campaign data)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            Map<String, Object> customerStats = customerService.getDashboardStats();
            Map<String, Object> campaignStats = campaignService.getGlobalStats();

            Map<String, Object> combined = new HashMap<>();
            combined.putAll(customerStats);
            combined.putAll(campaignStats);

            return ResponseEntity.ok(combined);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Status check
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        boolean configured = agentService.isConfigured();
        return ResponseEntity.ok(Map.of(
                "configured", configured,
                "message", configured ? "Xeno AI is ready" : "Please configure OPENROUTER_API_KEY"
        ));
    }
}