package com.xeno.agent.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * User preferences model
 */
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column
    private String theme = "light";

    @Column
    private Boolean voiceEnabled = true;

    @Column
    private String language = "en";

    @Column
    private Integer maxHistoryMessages = 50;

    @Column
    private String preferredModel = "default";

    @Column
    private LocalDateTime updatedAt;

    // Default constructor
    public UserPreferences() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with user
    public UserPreferences(User user) {
        this();
        this.user = user;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.updatedAt = LocalDateTime.now();
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
        this.updatedAt = LocalDateTime.now();
    }

    public Boolean getVoiceEnabled() {
        return voiceEnabled;
    }

    public void setVoiceEnabled(Boolean voiceEnabled) {
        this.voiceEnabled = voiceEnabled;
        this.updatedAt = LocalDateTime.now();
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getMaxHistoryMessages() {
        return maxHistoryMessages;
    }

    public void setMaxHistoryMessages(Integer maxHistoryMessages) {
        this.maxHistoryMessages = maxHistoryMessages;
        this.updatedAt = LocalDateTime.now();
    }

    public String getPreferredModel() {
        return preferredModel;
    }

    public void setPreferredModel(String preferredModel) {
        this.preferredModel = preferredModel;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}