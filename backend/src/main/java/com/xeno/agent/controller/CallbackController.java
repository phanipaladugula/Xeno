package com.xeno.agent.controller;

import com.xeno.agent.model.CampaignRecipient;
import com.xeno.agent.repository.CampaignRecipientRepository;
import com.xeno.agent.repository.CampaignRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/callbacks")
public class CallbackController {

    private final CampaignRecipientRepository recipientRepository;
    private final CampaignRepository campaignRepository;

    public CallbackController(CampaignRecipientRepository recipientRepository, CampaignRepository campaignRepository) {
        this.recipientRepository = recipientRepository;
        this.campaignRepository = campaignRepository;
    }

    @PostMapping("/receipt")
    @Transactional
    public ResponseEntity<String> handleReceipt(@RequestBody Map<String, Object> payload) {
        String messageId = (String) payload.get("messageId");
        String statusStr = (String) payload.get("status");

        if (messageId == null || statusStr == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        try {
            CampaignRecipient.DeliveryStatus status = CampaignRecipient.DeliveryStatus.valueOf(statusStr.toUpperCase());

            recipientRepository.findByMessageId(messageId).ifPresent(recipient -> {
                // Prevent backward state transitions
                if (status == CampaignRecipient.DeliveryStatus.DELIVERED && recipient.getStatus().ordinal() >= CampaignRecipient.DeliveryStatus.DELIVERED.ordinal()) return;
                if (status == CampaignRecipient.DeliveryStatus.OPENED && recipient.getStatus().ordinal() >= CampaignRecipient.DeliveryStatus.OPENED.ordinal()) return;
                if (status == CampaignRecipient.DeliveryStatus.CLICKED && recipient.getStatus().ordinal() >= CampaignRecipient.DeliveryStatus.CLICKED.ordinal()) return;
                if (status == CampaignRecipient.DeliveryStatus.FAILED && recipient.getStatus() != CampaignRecipient.DeliveryStatus.SENT) return;

                recipient.setStatus(status);
                
                switch (status) {
                    case DELIVERED: recipient.setDeliveredAt(LocalDateTime.now()); break;
                    case OPENED: recipient.setOpenedAt(LocalDateTime.now()); break;
                    case CLICKED: recipient.setClickedAt(LocalDateTime.now()); break;
                    default: break;
                }
                recipientRepository.save(recipient);
                
                // Update campaign aggregates
                incrementCampaignStat(recipient.getCampaign().getId(), statusStr.toLowerCase());
            });

            return ResponseEntity.ok("Receipt processed");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }

    private void incrementCampaignStat(Long campaignId, String stat) {
        campaignRepository.findById(campaignId).ifPresent(campaign -> {
            switch (stat) {
                case "sent":       campaign.setTotalSent(campaign.getTotalSent() + 1); break;
                case "delivered":  campaign.setTotalDelivered(campaign.getTotalDelivered() + 1); break;
                case "failed":     campaign.setTotalFailed(campaign.getTotalFailed() + 1); break;
                case "opened":     campaign.setTotalOpened(campaign.getTotalOpened() + 1); break;
                case "clicked":    campaign.setTotalClicked(campaign.getTotalClicked() + 1); break;
            }
            campaignRepository.save(campaign);
        });
    }
}
