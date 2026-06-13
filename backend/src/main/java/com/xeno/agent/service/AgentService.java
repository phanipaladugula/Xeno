package com.xeno.agent.service;

import com.xeno.agent.model.Message;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for AI agent operations
 */
@Service
public class AgentService {

    private final LLMService llmService;

    public AgentService(LLMService llmService) {
        this.llmService = llmService;
    }

    /**
     * Process a user message and get AI response
     */
    public String processMessage(String userMessage, List<Message> history) {
        // Convert message history to format expected by LLM
        List<Map<String, String>> llmHistory = new ArrayList<>();

        if (history != null) {
            for (Message msg : history) {
                Map<String, String> historyMsg = new HashMap<>();
                historyMsg.put("role", msg.getSender().equals("ai") ? "assistant" : "user");
                historyMsg.put("content", msg.getContent());
                llmHistory.add(historyMsg);
            }
        }

        // Get response from LLM
        String response = llmService.sendMessage(userMessage, llmHistory);

        return response;
    }

    /**
     * Check if agent is configured
     */
    public boolean isConfigured() {
        return llmService.isConfigured();
    }
}