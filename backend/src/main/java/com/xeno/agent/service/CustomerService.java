package com.xeno.agent.service;

import com.xeno.agent.model.*;
import com.xeno.agent.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Page<Customer> getCustomers(int page, int size, String search) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search != null && !search.isEmpty()) {
            return customerRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable);
        }
        return customerRepository.findAll(pageable);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer updated) {
        Customer existing = getCustomerById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setCity(updated.getCity());
        existing.setCountry(updated.getCountry());
        existing.setTags(updated.getTags());
        return customerRepository.save(existing);
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    public List<Customer> findByFilters(
            Double minSpend, Double maxSpend, String city,
            Integer daysSinceLastPurchase, Integer minOrders, String tag) {

        LocalDate lastPurchaseBefore = daysSinceLastPurchase != null
                ? LocalDate.now().minusDays(daysSinceLastPurchase) : null;

        return customerRepository.findByFilters(
                minSpend, maxSpend, city, lastPurchaseBefore, null, minOrders, tag);
    }

    public Map<String, Object> getDashboardStats() {
        long totalCustomers = customerRepository.count();
        Double totalRevenue = customerRepository.sumTotalRevenue();
        long activeCustomers = customerRepository.countActiveAfter(LocalDate.now().minusDays(30));

        return Map.of(
                "totalCustomers", totalCustomers,
                "totalRevenue", totalRevenue != null ? totalRevenue : 0.0,
                "activeCustomers", activeCustomers
        );
    }
}
