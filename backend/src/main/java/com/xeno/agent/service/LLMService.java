package com.xeno.agent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for LLM interactions via OpenRouter API
 */
@Service
public class LLMService {

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String DEFAULT_MODEL = "anthropic/claude-3-haiku";

    private final RestTemplate restTemplate;

    public LLMService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send message to LLM
     */
    public String sendMessage(String prompt, List<Map<String, String>> history) {
        if (openRouterApiKey == null || openRouterApiKey.isEmpty()) {
            return "API key not configured. Please set OPENROUTER_API_KEY.";
        }

        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openRouterApiKey);
            headers.set("HTTP-Referer", "https://xeno.ai");
            headers.set("X-Title", "Xeno Agent");

            // Prepare messages
            List<Map<String, String>> messages = new ArrayList<>();

            // Add system message
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "You are Xeno, a helpful AI assistant. Be friendly and concise.");
            messages.add(systemMessage);

            // Add history
            if (history != null) {
                for (Map<String, String> msg : history) {
                    messages.add(msg);
                }
            }

            // Add current prompt
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            messages.add(userMessage);

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", DEFAULT_MODEL);
            requestBody.put("messages", messages);

            // Make request
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    OPENROUTER_API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            // Parse response
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }

            return "Unable to get response from LLM";
        } catch (Exception e) {
            return "Error communicating with LLM: " + e.getMessage();
        }
    }

    /**
     * Set system prompt
     */
    public void setSystemPrompt(String prompt) {
        // This would be stored in a config or cache
        // For now, this is a placeholder
    }

    /**
     * Check if API key is configured
     */
    public boolean isConfigured() {
        return openRouterApiKey != null && !openRouterApiKey.isEmpty();
    }
}