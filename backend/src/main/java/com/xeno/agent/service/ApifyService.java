package com.xeno.agent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for Apify browser automation
 */
@Service
public class ApifyService {

    @Value("${apify.api.key:}")
    private String apifyApiKey;

    private static final String APIFY_API_URL = "https://api.apify.com/v2";
    private static final String ACTORS_BASE_URL = APIFY_API_URL + "/acts";

    private final RestTemplate restTemplate;

    public ApifyService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Run an Apify actor
     */
    public Map<String, Object> runActor(String actorId, Map<String, Object> input) {
        if (apifyApiKey == null || apifyApiKey.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "API key not configured");
            return error;
        }

        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apifyApiKey);

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("input", input);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            // Make request to start actor run
            ResponseEntity<Map> response = restTemplate.exchange(
                    ACTORS_BASE_URL + "/" + actorId + "/runs",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to run actor: " + e.getMessage());
            return error;
        }
    }

    /**
     * Get dataset results
     */
    public List<Map<String, Object>> getDataset(String datasetId) {
        if (apifyApiKey == null || apifyApiKey.isEmpty()) {
            return List.of();
        }

        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apifyApiKey);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            // Make request to get dataset
            ResponseEntity<Map> response = restTemplate.exchange(
                    APIFY_API_URL + "/datasets/" + datasetId + "/items",
                    HttpMethod.GET,
                    requestEntity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null) {
                return (List<Map<String, Object>>) body.get("items");
            }

            return List.of();
        } catch (Exception e) {
            System.err.println("Failed to get dataset: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Perform web search
     */
    public Map<String, Object> searchWeb(String query) {
        if (apifyApiKey == null || apifyApiKey.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("error", "API key not configured");
            result.put("query", query);
            result.put("results", List.of());
            return result;
        }

        try {
            // Use Google Search Results Scraper actor
            Map<String, Object> input = new HashMap<>();
            input.put("queries", query);
            input.put("maxResults", 10);

            Map<String, Object> runResult = runActor("apify/google-search-scraper", input);

            if (runResult.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) runResult.get("data");
                String datasetId = (String) data.get("defaultDatasetId");

                if (datasetId != null) {
                    List<Map<String, Object>> results = getDataset(datasetId);

                    Map<String, Object> searchResult = new HashMap<>();
                    searchResult.put("query", query);
                    searchResult.put("results", results);
                    return searchResult;
                }
            }

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "Failed to get search results");
            errorResult.put("query", query);
            return errorResult;
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "Search failed: " + e.getMessage());
            errorResult.put("query", query);
            return errorResult;
        }
    }

    /**
     * Extract content from a URL
     */
    public Map<String, Object> extractContent(String url) {
        if (apifyApiKey == null || apifyApiKey.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "API key not configured");
            error.put("url", url);
            return error;
        }

        try {
            // Use Website Content Crawler actor
            Map<String, Object> input = new HashMap<>();
            input.put("startUrls", List.of(url));
            input.put("maxCrawlingDepth", 1);

            Map<String, Object> runResult = runActor("apify/website-content-crawler", input);

            if (runResult.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) runResult.get("data");
                String datasetId = (String) data.get("defaultDatasetId");

                if (datasetId != null) {
                    List<Map<String, Object>> results = getDataset(datasetId);

                    Map<String, Object> contentResult = new HashMap<>();
                    contentResult.put("url", url);
                    contentResult.put("content", results);
                    return contentResult;
                }
            }

            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "Failed to extract content");
            errorResult.put("url", url);
            return errorResult;
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "Extraction failed: " + e.getMessage());
            errorResult.put("url", url);
            return errorResult;
        }
    }

    /**
     * Check if Apify is configured
     */
    public boolean isConfigured() {
        return apifyApiKey != null && !apifyApiKey.isEmpty();
    }
}