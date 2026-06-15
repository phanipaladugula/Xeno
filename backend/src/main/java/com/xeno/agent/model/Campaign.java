package com.xeno.agent.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
public class Campaign {

    public enum Status {
        DRAFT, SENDING, SENT, FAILED, PAUSED
    }

    public enum Channel {
        WHATSAPP, EMAIL, SMS, RCS
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "segment_id")
    private Segment segment;

    @Enumerated(EnumType.STRING)
    private Channel channel;

    @Column(name = "message_template", columnDefinition = "TEXT")
    private String messageTemplate;

    @Enumerated(EnumType.STRING)
    private Status status = Status.DRAFT;

    // Stats (denormalized for fast reads)
    @Column(name = "total_sent")
    private Integer totalSent = 0;

    @Column(name = "total_delivered")
    private Integer totalDelivered = 0;

    @Column(name = "total_failed")
    private Integer totalFailed = 0;

    @Column(name = "total_opened")
    private Integer totalOpened = 0;

    @Column(name = "total_clicked")
    private Integer totalClicked = 0;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Campaign() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Segment getSegment() { return segment; }
    public void setSegment(Segment segment) { this.segment = segment; }

    public Channel getChannel() { return channel; }
    public void setChannel(Channel channel) { this.channel = channel; }

    public String getMessageTemplate() { return messageTemplate; }
    public void setMessageTemplate(String messageTemplate) { this.messageTemplate = messageTemplate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Integer getTotalSent() { return totalSent; }
    public void setTotalSent(Integer totalSent) { this.totalSent = totalSent; }

    public Integer getTotalDelivered() { return totalDelivered; }
    public void setTotalDelivered(Integer totalDelivered) { this.totalDelivered = totalDelivered; }

    public Integer getTotalFailed() { return totalFailed; }
    public void setTotalFailed(Integer totalFailed) { this.totalFailed = totalFailed; }

    public Integer getTotalOpened() { return totalOpened; }
    public void setTotalOpened(Integer totalOpened) { this.totalOpened = totalOpened; }

    public Integer getTotalClicked() { return totalClicked; }
    public void setTotalClicked(Integer totalClicked) { this.totalClicked = totalClicked; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
