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
 * Service for LLM interactions via OpenRouter API with Tool Calling support.
 */
@Service
public class LLMService {

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String DEFAULT_MODEL = "openai/gpt-4o";

    private final RestTemplate restTemplate;

    public LLMService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send message to LLM with tools
     */
    public Map<String, Object> sendChatCompletion(List<Map<String, Object>> messages, List<Map<String, Object>> tools) {
        if (openRouterApiKey == null || openRouterApiKey.isEmpty()) {
            return Map.of("content", "⚠️ OpenRouter API key not configured.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + openRouterApiKey);
            headers.set("HTTP-Referer", "https://getxeno.com");
            headers.set("X-Title", "Xeno CRM Agent");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", DEFAULT_MODEL);
            requestBody.put("messages", messages);
            
            if (tools != null && !tools.isEmpty()) {
                requestBody.put("tools", tools);
            }
            
            requestBody.put("max_tokens", 4096);
            requestBody.put("temperature", 0.3);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    OPENROUTER_API_URL, HttpMethod.POST, requestEntity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    return (Map<String, Object>) choices.get(0).get("message");
                }
            }

            return Map.of("content", "Unable to get response from AI.");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("content", "Error communicating with AI: " + e.getMessage());
        }
    }

    public boolean isConfigured() {
        return openRouterApiKey != null && !openRouterApiKey.isEmpty();
    }
}