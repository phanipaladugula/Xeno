package com.xeno.agent.model;

import jakarta.persistence.*;

/**
 * ChatParticipant model for group chat participants
 */
@Entity
@Table(name = "chat_participants")
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantRole role = ParticipantRole.MEMBER;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    // Default constructor
    public ChatParticipant() {
        this.joinedAt = LocalDateTime.now();
    }

    // Constructor with parameters
    public ChatParticipant(Chat chat, User user) {
        this();
        this.chat = chat;
        this.user = user;
    }

    // Constructor with role
    public ChatParticipant(Chat chat, User user, ParticipantRole role) {
        this(chat, user);
        this.role = role;
    }

    // Participant role enum
    public enum ParticipantRole {
        ADMIN,
        MODERATOR,
        MEMBER
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ParticipantRole getRole() {
        return role;
    }

    public void setRole(ParticipantRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}