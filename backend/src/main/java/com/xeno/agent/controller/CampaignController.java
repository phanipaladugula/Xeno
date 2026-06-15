package com.xeno.agent.controller;

import com.xeno.agent.model.Campaign;
import com.xeno.agent.model.Segment;
import com.xeno.agent.service.CampaignService;
import com.xeno.agent.repository.SegmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = {"https://xeno-sigma-three.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:4173"})
public class CampaignController {

    private final CampaignService campaignService;
    private final SegmentRepository segmentRepository;

    public CampaignController(CampaignService campaignService, SegmentRepository segmentRepository) {
        this.campaignService = campaignService;
        this.segmentRepository = segmentRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCampaign(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(campaignService.getCampaignById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCampaign(@RequestBody Map<String, Object> body) {
        try {
            Campaign campaign = new Campaign();
            campaign.setName((String) body.get("name"));
            campaign.setDescription((String) body.get("description"));
            campaign.setMessageTemplate((String) body.get("messageTemplate"));

            String channelStr = (String) body.get("channel");
            if (channelStr != null) {
                campaign.setChannel(Campaign.Channel.valueOf(channelStr.toUpperCase()));
            }

            Object segmentIdObj = body.get("segmentId");
            if (segmentIdObj != null) {
                Long segmentId = Long.parseLong(segmentIdObj.toString());
                Segment segment = segmentRepository.findById(segmentId)
                        .orElseThrow(() -> new RuntimeException("Segment not found"));
                campaign.setSegment(segment);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(campaignService.createCampaign(campaign));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Campaign updated = new Campaign();
            updated.setName((String) body.get("name"));
            updated.setDescription((String) body.get("description"));
            updated.setMessageTemplate((String) body.get("messageTemplate"));

            String channelStr = (String) body.get("channel");
            if (channelStr != null) {
                updated.setChannel(Campaign.Channel.valueOf(channelStr.toUpperCase()));
            }

            Object segmentIdObj = body.get("segmentId");
            if (segmentIdObj != null) {
                Long segmentId = Long.parseLong(segmentIdObj.toString());
                Segment segment = segmentRepository.findById(segmentId)
                        .orElseThrow(() -> new RuntimeException("Segment not found"));
                updated.setSegment(segment);
            }

            return ResponseEntity.ok(campaignService.updateCampaign(id, updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCampaign(@PathVariable Long id) {
        try {
            campaignService.deleteCampaign(id);
            return ResponseEntity.ok(Map.of("message", "Campaign deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/launch")
    public ResponseEntity<?> launchCampaign(@PathVariable Long id) {
        try {
            Campaign launched = campaignService.launchCampaign(id);
            return ResponseEntity.ok(launched);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getCampaignStats(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(campaignService.getCampaignStats(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/recipients")
    public ResponseEntity<?> getCampaignRecipients(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(campaignService.getCampaignRecipients(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats/global")
    public ResponseEntity<?> getGlobalStats() {
        return ResponseEntity.ok(campaignService.getGlobalStats());
    }
}
