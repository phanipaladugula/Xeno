package com.xeno.agent.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Message model for chat messages
 */
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Boolean isAiResponse = false;

    // Default constructor
    public Message() {
        this.timestamp = LocalDateTime.now();
    }

    // Constructor with parameters
    public Message(Chat chat, String content, String sender) {
        this();
        this.chat = chat;
        this.content = content;
        this.sender = sender;
    }

    // Constructor with AI response flag
    public Message(Chat chat, String content, String sender, Boolean isAiResponse) {
        this(chat, content, sender);
        this.isAiResponse = isAiResponse;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getIsAiResponse() {
        return isAiResponse;
    }

    public void setIsAiResponse(Boolean isAiResponse) {
        this.isAiResponse = isAiResponse;
    }
}