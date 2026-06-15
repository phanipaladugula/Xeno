package com.xeno.agent.service;

import com.xeno.agent.model.*;
import com.xeno.agent.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * CRM's internal Channel Service client that calls external providers.
 */
@Service
public class ChannelService {

    private final CampaignRecipientRepository recipientRepository;
    private final CampaignRepository campaignRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public ChannelService(CampaignRecipientRepository recipientRepository,
                          CampaignRepository campaignRepository) {
        this.recipientRepository = recipientRepository;
        this.campaignRepository = campaignRepository;
    }

    /**
     * Dispatch message to external provider API.
     */
    public void sendMessage(CampaignRecipient recipient) {
        // Mark as SENT immediately as it leaves the CRM
        recipient.setStatus(CampaignRecipient.DeliveryStatus.SENT);
        recipient.setSentAt(LocalDateTime.now());
        recipientRepository.save(recipient);

        incrementCampaignStat(recipient.getCampaign().getId(), "sent");

        try {
            // Call the stubbed external channel API
            String apiUrl = "http://localhost:8080/channel-api/send";
            restTemplate.postForEntity(apiUrl, Map.of(
                    "messageId", recipient.getMessageId(),
                    "channel", recipient.getCampaign().getChannel().name(),
                    "content", recipient.getPersonalizedMessage(),
                    "recipient", recipient.getCustomer().getPhone() != null ? recipient.getCustomer().getPhone() : recipient.getCustomer().getEmail()
            ), String.class);
        } catch (Exception e) {
            // Fallback if API fails
            System.err.println("Failed to dispatch to Channel API: " + e.getMessage());
            recipient.setStatus(CampaignRecipient.DeliveryStatus.FAILED);
            recipientRepository.save(recipient);
            incrementCampaignStat(recipient.getCampaign().getId(), "failed");
        }
    }

    private synchronized void incrementCampaignStat(Long campaignId, String stat) {
        campaignRepository.findById(campaignId).ifPresent(campaign -> {
            switch (stat) {
                case "sent":       campaign.setTotalSent(campaign.getTotalSent() + 1); break;
                case "failed":     campaign.setTotalFailed(campaign.getTotalFailed() + 1); break;
            }
            campaignRepository.save(campaign);
        });
    }

    public String personalizeMessage(String template, Customer customer) {
        if (template == null) return "";
        return template
                .replace("{{name}}", customer.getName() != null ? customer.getName().split(" ")[0] : "Friend")
                .replace("{{email}}", customer.getEmail() != null ? customer.getEmail() : "")
                .replace("{{city}}", customer.getCity() != null ? customer.getCity() : "")
                .replace("{{totalSpend}}", customer.getTotalSpend() != null
                        ? String.format("%.0f", customer.getTotalSpend()) : "0");
    }
}
