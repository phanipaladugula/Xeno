package com.xeno.agent.service;

import com.xeno.agent.model.*;
import com.xeno.agent.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final SegmentService segmentService;
    private final ChannelService channelService;

    public CampaignService(
            CampaignRepository campaignRepository,
            CampaignRecipientRepository recipientRepository,
            SegmentService segmentService,
            ChannelService channelService) {
        this.campaignRepository = campaignRepository;
        this.recipientRepository = recipientRepository;
        this.segmentService = segmentService;
        this.channelService = channelService;
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAllByOrderByCreatedAtDesc();
    }

    public Campaign getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + id));
    }

    public Campaign createCampaign(Campaign campaign) {
        campaign.setStatus(Campaign.Status.DRAFT);
        return campaignRepository.saveAndFlush(campaign);
    }

    public Campaign updateCampaign(Long id, Campaign updated) {
        Campaign existing = getCampaignById(id);
        if (existing.getStatus() != Campaign.Status.DRAFT) {
            throw new RuntimeException("Only DRAFT campaigns can be edited");
        }
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setSegment(updated.getSegment());
        existing.setChannel(updated.getChannel());
        existing.setMessageTemplate(updated.getMessageTemplate());
        return campaignRepository.save(existing);
    }

    public void deleteCampaign(Long id) {
        Campaign campaign = getCampaignById(id);
        recipientRepository.findByCampaignId(id).forEach(recipientRepository::delete);
        campaignRepository.delete(campaign);
    }

    /**
     * Launch a campaign: resolve segment → create recipient records → send via channel service
     */
    @Transactional
    public Campaign launchCampaign(Long campaignId) {
        Campaign campaign = getCampaignById(campaignId);

        if (campaign.getStatus() != Campaign.Status.DRAFT) {
            throw new RuntimeException("Only DRAFT campaigns can be launched");
        }

        if (campaign.getSegment() == null) {
            throw new RuntimeException("Campaign must have a segment selected");
        }

        // Get customers in segment
        List<Customer> customers = segmentService.getCustomersInSegment(campaign.getSegment().getId());

        if (customers.isEmpty()) {
            throw new RuntimeException("No customers match the selected segment");
        }

        // Update campaign status to SENDING
        campaign.setStatus(Campaign.Status.SENDING);
        campaign.setSentAt(LocalDateTime.now());
        campaign = campaignRepository.saveAndFlush(campaign);

        // Create recipient records and dispatch async sends
        for (Customer customer : customers) {
            String messageId = "msg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            String personalizedMsg = channelService.personalizeMessage(
                    campaign.getMessageTemplate(), customer);

            CampaignRecipient recipient = new CampaignRecipient(
                    campaign, customer, messageId, personalizedMsg);
            recipient = recipientRepository.save(recipient);

            // Fire and forget — async channel simulation
            channelService.sendMessage(recipient);
        }

        // Mark as SENT after dispatching all (actual stats update async)
        campaign.setStatus(Campaign.Status.SENT);
        return campaignRepository.save(campaign);
    }

    /**
     * Get detailed stats for a campaign
     */
    public Map<String, Object> getCampaignStats(Long campaignId) {
        Campaign campaign = getCampaignById(campaignId);
        long totalRecipients = recipientRepository.countByCampaignId(campaignId);
        long delivered = recipientRepository.countByCampaignIdAndStatus(campaignId, CampaignRecipient.DeliveryStatus.DELIVERED);
        long failed = recipientRepository.countByCampaignIdAndStatus(campaignId, CampaignRecipient.DeliveryStatus.FAILED);
        long opened = recipientRepository.countByCampaignIdAndStatus(campaignId, CampaignRecipient.DeliveryStatus.OPENED);
        long clicked = recipientRepository.countByCampaignIdAndStatus(campaignId, CampaignRecipient.DeliveryStatus.CLICKED);
        long sent = recipientRepository.countByCampaignIdAndStatus(campaignId, CampaignRecipient.DeliveryStatus.SENT);

        // Combine counts from DB for accuracy
        long totalDelivered = delivered + opened + clicked;
        long totalOpened = opened + clicked;

        return Map.of(
                "totalRecipients", totalRecipients,
                "sent", campaign.getTotalSent(),
                "delivered", campaign.getTotalDelivered(),
                "failed", campaign.getTotalFailed(),
                "opened", campaign.getTotalOpened(),
                "clicked", campaign.getTotalClicked(),
                "deliveryRate", totalRecipients > 0 ? (double)(campaign.getTotalDelivered() + campaign.getTotalOpened() + campaign.getTotalClicked()) / totalRecipients * 100 : 0,
                "openRate", totalRecipients > 0 ? (double)(campaign.getTotalOpened() + campaign.getTotalClicked()) / totalRecipients * 100 : 0,
                "clickRate", totalRecipients > 0 ? (double)campaign.getTotalClicked() / totalRecipients * 100 : 0,
                "campaign", campaign
        );
    }

    /**
     * Get global stats for dashboard
     */
    public Map<String, Object> getGlobalStats() {
        long totalCampaigns = campaignRepository.count();
        long activeCampaigns = campaignRepository.countByStatus(Campaign.Status.SENDING) +
                campaignRepository.countByStatus(Campaign.Status.SENT);

        List<Campaign> allCampaigns = campaignRepository.findAll();
        long totalMessagesSent = allCampaigns.stream().mapToLong(Campaign::getTotalSent).sum();
        long totalOpened = allCampaigns.stream().mapToLong(Campaign::getTotalOpened).sum();
        long totalClicked = allCampaigns.stream().mapToLong(Campaign::getTotalClicked).sum();

        double avgEngagement = totalMessagesSent > 0
                ? (double)(totalOpened + totalClicked) / totalMessagesSent * 100 : 0;

        return Map.of(
                "totalCampaigns", totalCampaigns,
                "activeCampaigns", activeCampaigns,
                "totalMessagesSent", totalMessagesSent,
                "avgEngagementRate", avgEngagement
        );
    }

    /**
     * Get recipients list for a campaign
     */
    public List<CampaignRecipient> getCampaignRecipients(Long campaignId) {
        return recipientRepository.findByCampaignId(campaignId);
    }
}
