package com.xeno.agent.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/channel-api")
public class ChannelStubController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Random random = new Random();

    @PostMapping("/send")
    public ResponseEntity<String> sendCommunication(@RequestBody Map<String, Object> payload) {
        String messageId = (String) payload.get("messageId");
        String channel = (String) payload.get("channel");
        
        if (messageId == null || channel == null) {
            return ResponseEntity.badRequest().body("Invalid payload");
        }

        // Simulate async processing
        simulateDeliveryLoop(messageId);

        return ResponseEntity.accepted().body("Accepted for delivery");
    }

    @Async
    public void simulateDeliveryLoop(String messageId) {
        try {
            // Wait to simulate network latency before "delivered" callback
            Thread.sleep(1000 + random.nextInt(2000));

            // 10% failure rate
            if (random.nextDouble() < 0.10) {
                sendCallback(messageId, "FAILED");
                return;
            }

            // Send DELIVERED callback
            sendCallback(messageId, "DELIVERED");

            // Wait 2-5 seconds, then simulate OPENED
            Thread.sleep(2000 + random.nextInt(3000));
            if (random.nextDouble() < 0.65) {
                sendCallback(messageId, "OPENED");

                // Wait 1-3 seconds, then simulate CLICKED
                Thread.sleep(1000 + random.nextInt(2000));
                if (random.nextDouble() < 0.30) {
                    sendCallback(messageId, "CLICKED");
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void sendCallback(String messageId, String status) {
        try {
            String callbackUrl = "http://localhost:8080/api/callbacks/receipt";
            restTemplate.postForEntity(callbackUrl, Map.of(
                    "messageId", messageId,
                    "status", status
            ), String.class);
        } catch (Exception e) {
            System.err.println("Failed to send callback for message " + messageId + ": " + e.getMessage());
        }
    }
}
