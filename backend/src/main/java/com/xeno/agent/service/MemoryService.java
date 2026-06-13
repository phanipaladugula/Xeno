package com.xeno.agent.service;

import com.xeno.agent.model.Chat;
import com.xeno.agent.model.Message;
import com.xeno.agent.model.Task;
import com.xeno.agent.model.User;
import com.xeno.agent.model.UserPreferences;
import com.xeno.agent.repository.ChatRepository;
import com.xeno.agent.repository.TaskRepository;
import com.xeno.agent.repository.UserPreferencesRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for memory operations
 */
@Service
public class MemoryService {

    private final UserPreferencesRepository userPreferencesRepository;
    private final ChatRepository chatRepository;
    private final TaskRepository taskRepository;

    public MemoryService(
            UserPreferencesRepository userPreferencesRepository,
            ChatRepository chatRepository,
            TaskRepository taskRepository) {
        this.userPreferencesRepository = userPreferencesRepository;
        this.chatRepository = chatRepository;
        this.taskRepository = taskRepository;
    }

    /**
     * Get or create user preferences
     */
    public UserPreferences getUserPreferences(User user) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId());

        if (preferences == null) {
            preferences = new UserPreferences(user);
            preferences = userPreferencesRepository.save(preferences);
        }

        return preferences;
    }

    /**
     * Update user preferences
     */
    public UserPreferences updateUserPreferences(Long userId, UserPreferences updates) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId);

        if (preferences == null) {
            throw new RuntimeException("User preferences not found");
        }

        if (updates.getTheme() != null) {
            preferences.setTheme(updates.getTheme());
        }
        if (updates.getVoiceEnabled() != null) {
            preferences.setVoiceEnabled(updates.getVoiceEnabled());
        }
        if (updates.getLanguage() != null) {
            preferences.setLanguage(updates.getLanguage());
        }
        if (updates.getMaxHistoryMessages() != null) {
            preferences.setMaxHistoryMessages(updates.getMaxHistoryMessages());
        }
        if (updates.getPreferredModel() != null) {
            preferences.setPreferredModel(updates.getPreferredModel());
        }

        return userPreferencesRepository.save(preferences);
    }

    /**
     * Get memory context for AI (recent messages and tasks)
     */
    public Map<String, Object> getContextForUser(Long userId) {
        Map<String, Object> context = new HashMap<>();

        // Get recent chats
        List<Chat> recentChats = chatRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // Get incomplete tasks
        List<Task> incompleteTasks = taskRepository.findByUserIdAndCompletedOrderByCreatedAtDesc(userId, false);

        // Get user preferences
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId);

        context.put("recentChats", recentChats);
        context.put("incompleteTasks", incompleteTasks);
        context.put("preferences", preferences);

        return context;
    }

    /**
     * Get chat history for context
     */
    public List<Message> getChatHistory(Long chatId) {
        // This is delegated to ChatService
        return List.of();
    }

    /**
     * Get memory usage statistics
     */
    public Map<String, Object> getMemoryStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();

        long totalChats = chatRepository.findByUserIdOrderByCreatedAtDesc(userId).size();
        long incompleteTasks = taskRepository.findByUserIdAndCompletedOrderByCreatedAtDesc(userId, false).size();
        long completedTasks = taskRepository.findByUserIdAndCompletedOrderByCreatedAtDesc(userId, true).size();

        stats.put("totalChats", totalChats);
        stats.put("incompleteTasks", incompleteTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("totalTasks", incompleteTasks + completedTasks);

        return stats;
    }
}