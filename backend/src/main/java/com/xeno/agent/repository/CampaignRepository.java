package com.xeno.agent.repository;

import com.xeno.agent.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findAllByOrderByCreatedAtDesc();
    List<Campaign> findByStatus(Campaign.Status status);
    long countByStatus(Campaign.Status status);
}
