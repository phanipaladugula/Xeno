package com.xeno.agent.repository;

import com.xeno.agent.model.CampaignRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, Long> {

    List<CampaignRecipient> findByCampaignId(Long campaignId);

    Optional<CampaignRecipient> findByMessageId(String messageId);

    long countByCampaignId(Long campaignId);

    long countByCampaignIdAndStatus(Long campaignId, CampaignRecipient.DeliveryStatus status);
}
