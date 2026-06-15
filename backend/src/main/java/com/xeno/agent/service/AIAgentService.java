package com.xeno.agent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xeno.agent.model.Campaign;
import com.xeno.agent.model.Customer;
import com.xeno.agent.model.Segment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIAgentService {

    private final LLMService llmService;
    private final CustomerService customerService;
    private final SegmentService segmentService;
    private final CampaignService campaignService;
    private final ApifyService apifyService;
    private final ObjectMapper mapper;

    public AIAgentService(LLMService llmService, CustomerService customerService, SegmentService segmentService, CampaignService campaignService, ApifyService apifyService, ObjectMapper mapper) {
        this.llmService = llmService;
        this.customerService = customerService;
        this.segmentService = segmentService;
        this.campaignService = campaignService;
        this.apifyService = apifyService;
        this.mapper = mapper;
    }

    public String processAgentRequest(String userPrompt, List<Map<String, String>> history) {
        List<Map<String, Object>> messages = new ArrayList<>();
        
        messages.add(Map.of(
            "role", "system",
            "content", "You are Xeno AI, an autonomous agent for a Mini CRM. You can execute marketing campaigns end-to-end, create segments, fetch customer data, and find leads on the internet. Use your tools to perform actions in the CRM database. Always respond with friendly, concise updates to the user."
        ));

        if (history != null) {
            for (Map<String, String> h : history) {
                Map<String, Object> hm = new HashMap<>(h);
                messages.add(hm);
            }
        }

        messages.add(Map.of("role", "user", "content", userPrompt));

        List<Map<String, Object>> tools = getAvailableTools();

        // Execution loop for autonomous tool calling
        for (int i = 0; i < 5; i++) {
            Map<String, Object> responseMessage = llmService.sendChatCompletion(messages, tools);

            if (responseMessage.containsKey("tool_calls")) {
                messages.add(responseMessage); // Add assistant's tool call message
                
                List<Map<String, Object>> toolCalls = (List<Map<String, Object>>) responseMessage.get("tool_calls");
                for (Map<String, Object> toolCall : toolCalls) {
                    Map<String, Object> function = (Map<String, Object>) toolCall.get("function");
                    String functionName = (String) function.get("name");
                    String arguments = (String) function.get("arguments");

                    String toolResultStr = executeTool(functionName, arguments);
                    
                    messages.add(Map.of(
                        "role", "tool",
                        "tool_call_id", toolCall.get("id"),
                        "name", functionName,
                        "content", toolResultStr
                    ));
                }
            } else {
                return (String) responseMessage.getOrDefault("content", "Error generating response.");
            }
        }

        return "I hit a limit trying to complete that request. Here's what I did so far: (Internal Loop Exceeded)";
    }

    private String executeTool(String name, String argumentsStr) {
        try {
            Map<String, Object> args = mapper.readValue(argumentsStr, Map.class);

            switch (name) {
                case "get_customers":
                    return mapper.writeValueAsString(customerService.getAllCustomers());
                
                case "create_segment":
                    Segment seg = new Segment();
                    seg.setName((String) args.get("name"));
                    seg.setDescription((String) args.get("description"));
                    seg.setRules(mapper.writeValueAsString(args.get("rules")));
                    seg = segmentService.createSegment(seg);
                    return "Created Segment ID: " + seg.getId() + " containing " + seg.getCustomerCount() + " customers.";

                case "create_campaign":
                    Campaign camp = new Campaign();
                    camp.setName((String) args.get("name"));
                    camp.setChannel(Campaign.Channel.valueOf(((String) args.get("channel")).toUpperCase()));
                    camp.setMessageTemplate((String) args.get("messageTemplate"));
                    
                    Long segmentId = ((Number) args.get("segmentId")).longValue();
                    camp.setSegment(segmentService.getSegmentById(segmentId));
                    camp = campaignService.createCampaign(camp);
                    return "Created Campaign ID: " + camp.getId();

                case "launch_campaign":
                    Long campId = ((Number) args.get("campaignId")).longValue();
                    campaignService.launchCampaign(campId);
                    return "Campaign " + campId + " launched successfully to external channel provider.";

                case "apify_web_search":
                    if (!apifyService.isConfigured()) return "Apify API Key missing.";
                    Map<String, Object> searchResult = apifyService.searchWeb((String) args.get("query"));
                    return mapper.writeValueAsString(searchResult);

                case "add_customer_lead":
                    Customer newCustomer = new Customer();
                    newCustomer.setName((String) args.get("name"));
                    newCustomer.setEmail((String) args.get("email"));
                    newCustomer.setCity((String) args.get("city"));
                    newCustomer.setTags((String) args.get("tags"));
                    newCustomer.setCreatedAt(LocalDateTime.now());
                    newCustomer.setTotalSpend(0.0);
                    newCustomer.setOrderCount(0);
                    customerService.createCustomer(newCustomer);
                    return "Lead added successfully.";

                case "update_customer":
                    Long customerId = ((Number) args.get("customerId")).longValue();
                    Customer customerToUpdate = customerService.getCustomerById(customerId);
                    if (args.containsKey("name")) customerToUpdate.setName((String) args.get("name"));
                    if (args.containsKey("email")) customerToUpdate.setEmail((String) args.get("email"));
                    if (args.containsKey("city")) customerToUpdate.setCity((String) args.get("city"));
                    if (args.containsKey("tags")) customerToUpdate.setTags((String) args.get("tags"));
                    customerService.updateCustomer(customerId, customerToUpdate);
                    return "Customer updated successfully.";

                case "update_segment":
                    Long segId = ((Number) args.get("segmentId")).longValue();
                    Segment segmentToUpdate = segmentService.getSegmentById(segId);
                    if (args.containsKey("name")) segmentToUpdate.setName((String) args.get("name"));
                    if (args.containsKey("description")) segmentToUpdate.setDescription((String) args.get("description"));
                    if (args.containsKey("rules")) segmentToUpdate.setRules(mapper.writeValueAsString(args.get("rules")));
                    segmentService.updateSegment(segId, segmentToUpdate);
                    return "Segment updated successfully.";

                case "update_campaign":
                    Long campUpdateId = ((Number) args.get("campaignId")).longValue();
                    Campaign campaignToUpdate = campaignService.getCampaignById(campUpdateId);
                    if (args.containsKey("name")) campaignToUpdate.setName((String) args.get("name"));
                    if (args.containsKey("channel")) campaignToUpdate.setChannel(Campaign.Channel.valueOf(((String) args.get("channel")).toUpperCase()));
                    if (args.containsKey("messageTemplate")) campaignToUpdate.setMessageTemplate((String) args.get("messageTemplate"));
                    if (args.containsKey("segmentId")) {
                        campaignToUpdate.setSegment(segmentService.getSegmentById(((Number) args.get("segmentId")).longValue()));
                    }
                    campaignService.updateCampaign(campUpdateId, campaignToUpdate);
                    return "Campaign updated successfully.";

                default:
                    return "Unknown tool: " + name;
            }
        } catch (Exception e) {
            return "Tool Execution Error: " + e.getMessage();
        }
    }

    private List<Map<String, Object>> getAvailableTools() {
        return List.of(
            createTool("get_customers", "Get all customers from the CRM database.", Map.of()),
            createTool("create_segment", "Create a new audience segment based on rules.", Map.of(
                "name", Map.of("type", "string"),
                "description", Map.of("type", "string"),
                "rules", Map.of("type", "object")
            )),
            createTool("create_campaign", "Draft a new campaign.", Map.of(
                "name", Map.of("type", "string"),
                "segmentId", Map.of("type", "integer"),
                "channel", Map.of("type", "string", "enum", List.of("WHATSAPP", "EMAIL", "SMS")),
                "messageTemplate", Map.of("type", "string")
            )),
            createTool("launch_campaign", "Launch a campaign to dispatch messages.", Map.of(
                "campaignId", Map.of("type", "integer")
            )),
            createTool("apify_web_search", "Search the web using Apify for leads or information.", Map.of(
                "query", Map.of("type", "string")
            )),
            createTool("add_customer_lead", "Add a new scraped lead to the CRM database.", Map.of(
                "name", Map.of("type", "string"),
                "email", Map.of("type", "string"),
                "city", Map.of("type", "string"),
                "tags", Map.of("type", "string")
            )),
            createTool("update_customer", "Update an existing customer's details.", Map.of(
                "customerId", Map.of("type", "integer"),
                "name", Map.of("type", "string"),
                "email", Map.of("type", "string"),
                "city", Map.of("type", "string"),
                "tags", Map.of("type", "string")
            )),
            createTool("update_segment", "Update an existing segment's details or rules.", Map.of(
                "segmentId", Map.of("type", "integer"),
                "name", Map.of("type", "string"),
                "description", Map.of("type", "string"),
                "rules", Map.of("type", "object")
            )),
            createTool("update_campaign", "Update an existing campaign's details.", Map.of(
                "campaignId", Map.of("type", "integer"),
                "name", Map.of("type", "string"),
                "channel", Map.of("type", "string", "enum", List.of("WHATSAPP", "EMAIL", "SMS")),
                "messageTemplate", Map.of("type", "string"),
                "segmentId", Map.of("type", "integer")
            ))
        );
    }

    private Map<String, Object> createTool(String name, String description, Map<String, Object> properties) {
        return Map.of(
            "type", "function",
            "function", Map.of(
                "name", name,
                "description", description,
                "parameters", Map.of(
                    "type", "object",
                    "properties", properties,
                    "required", properties.keySet().toArray(new String[0])
                )
            )
        );
    }

    public boolean isConfigured() {
        return llmService.isConfigured();
    }
}
