package com.xeno.agent.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xeno.agent.model.Customer;
import com.xeno.agent.model.Segment;
import com.xeno.agent.repository.CustomerRepository;
import com.xeno.agent.repository.SegmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SegmentService {

    private final SegmentRepository segmentRepository;
    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SegmentService(SegmentRepository segmentRepository, CustomerRepository customerRepository) {
        this.segmentRepository = segmentRepository;
        this.customerRepository = customerRepository;
    }

    public List<Segment> getAllSegments() {
        return segmentRepository.findAllByOrderByCreatedAtDesc();
    }

    public Segment getSegmentById(Long id) {
        return segmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Segment not found: " + id));
    }

    public Segment createSegment(Segment segment) {
        // Evaluate and set customer count
        List<Customer> matched = evaluateRules(segment.getRules());
        segment.setCustomerCount(matched.size());
        return segmentRepository.save(segment);
    }

    public Segment updateSegment(Long id, Segment updated) {
        Segment existing = getSegmentById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setRules(updated.getRules());
        List<Customer> matched = evaluateRules(updated.getRules());
        existing.setCustomerCount(matched.size());
        return segmentRepository.save(existing);
    }

    public void deleteSegment(Long id) {
        segmentRepository.deleteById(id);
    }

    /**
     * Preview how many customers match a rule set (without saving)
     */
    public int previewSegment(String rulesJson) {
        return evaluateRules(rulesJson).size();
    }

    /**
     * Get customers matching a segment's rules
     */
    public List<Customer> getCustomersInSegment(Long segmentId) {
        Segment segment = getSegmentById(segmentId);
        return evaluateRules(segment.getRules());
    }

    /**
     * Evaluate rules JSON against customer database
     * Rules format:
     * {
     *   "operator": "AND",
     *   "conditions": [
     *     {"field": "totalSpend", "op": "gte", "value": 500},
     *     {"field": "daysSinceLastPurchase", "op": "gt", "value": 30},
     *     {"field": "city", "op": "eq", "value": "Mumbai"},
     *     {"field": "orderCount", "op": "gte", "value": 3},
     *     {"field": "tag", "op": "contains", "value": "vip"}
     *   ]
     * }
     */
    @SuppressWarnings("unchecked")
    public List<Customer> evaluateRules(String rulesJson) {
        if (rulesJson == null || rulesJson.isBlank()) {
            return customerRepository.findAll();
        }

        try {
            Map<String, Object> rules = objectMapper.readValue(rulesJson, Map.class);
            String operator = (String) rules.getOrDefault("operator", "AND");
            List<Map<String, Object>> conditions = (List<Map<String, Object>>) rules.get("conditions");

            if (conditions == null || conditions.isEmpty()) {
                return customerRepository.findAll();
            }

            List<Customer> allCustomers = customerRepository.findAll();
            List<Customer> matched = new ArrayList<>();

            for (Customer customer : allCustomers) {
                boolean result = "AND".equals(operator)
                        ? matchesAll(customer, conditions)
                        : matchesAny(customer, conditions);
                if (result) {
                    matched.add(customer);
                }
            }

            return matched;

        } catch (Exception e) {
            // If rules are invalid, return all customers
            return customerRepository.findAll();
        }
    }

    private boolean matchesAll(Customer customer, List<Map<String, Object>> conditions) {
        for (Map<String, Object> condition : conditions) {
            if (!matchesCondition(customer, condition)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchesAny(Customer customer, List<Map<String, Object>> conditions) {
        for (Map<String, Object> condition : conditions) {
            if (matchesCondition(customer, condition)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesCondition(Customer customer, Map<String, Object> condition) {
        String field = (String) condition.get("field");
        String op = (String) condition.get("op");
        Object value = condition.get("value");

        if (field == null || op == null) return true;

        switch (field) {
            case "totalSpend":
                return compareDouble(customer.getTotalSpend(), op, toDouble(value));
            case "orderCount":
                return compareInt(customer.getOrderCount(), op, toInt(value));
            case "daysSinceLastPurchase":
                if (customer.getLastPurchaseDate() == null) return "gt".equals(op) || "gte".equals(op);
                long days = LocalDate.now().toEpochDay() - customer.getLastPurchaseDate().toEpochDay();
                return compareDouble((double) days, op, toDouble(value));
            case "city":
                return compareString(customer.getCity(), op, value != null ? value.toString() : "");
            case "country":
                return compareString(customer.getCountry(), op, value != null ? value.toString() : "");
            case "tag":
                String tags = customer.getTags();
                if (tags == null) return false;
                return tags.toLowerCase().contains(value.toString().toLowerCase());
            default:
                return true;
        }
    }

    private boolean compareDouble(Double fieldVal, String op, Double compareVal) {
        if (fieldVal == null) return false;
        switch (op) {
            case "gt": return fieldVal > compareVal;
            case "gte": return fieldVal >= compareVal;
            case "lt": return fieldVal < compareVal;
            case "lte": return fieldVal <= compareVal;
            case "eq": return fieldVal.equals(compareVal);
            default: return true;
        }
    }

    private boolean compareInt(Integer fieldVal, String op, int compareVal) {
        if (fieldVal == null) return false;
        switch (op) {
            case "gt": return fieldVal > compareVal;
            case "gte": return fieldVal >= compareVal;
            case "lt": return fieldVal < compareVal;
            case "lte": return fieldVal <= compareVal;
            case "eq": return fieldVal == compareVal;
            default: return true;
        }
    }

    private boolean compareString(String fieldVal, String op, String compareVal) {
        if (fieldVal == null) return false;
        switch (op) {
            case "eq": return fieldVal.equalsIgnoreCase(compareVal);
            case "contains": return fieldVal.toLowerCase().contains(compareVal.toLowerCase());
            case "neq": return !fieldVal.equalsIgnoreCase(compareVal);
            default: return true;
        }
    }

    private double toDouble(Object val) {
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return 0; }
    }

    private int toInt(Object val) {
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return 0; }
    }
}
