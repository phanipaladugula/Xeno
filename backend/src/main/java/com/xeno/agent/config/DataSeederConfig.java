package com.xeno.agent.config;

import com.xeno.agent.model.*;
import com.xeno.agent.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Seeds realistic demo data on startup (200 customers + 800 orders + segments + campaigns)
 */
@Configuration
public class DataSeederConfig {

    private static final String[] FIRST_NAMES = {
        "Aarav", "Priya", "Rohan", "Sneha", "Arjun", "Meera", "Vikram", "Ananya",
        "Rahul", "Pooja", "Kiran", "Divya", "Siddharth", "Neha", "Amit", "Riya",
        "Aditya", "Sakshi", "Nikhil", "Shreya", "Kabir", "Isha", "Varun", "Tanvi",
        "Harsh", "Simran", "Dev", "Nisha", "Yash", "Komal", "Jay", "Anjali",
        "Saurabh", "Kavya", "Piyush", "Swati", "Akash", "Deepika", "Gaurav", "Mansi"
    };

    private static final String[] LAST_NAMES = {
        "Sharma", "Patel", "Gupta", "Singh", "Kumar", "Mehta", "Shah", "Verma",
        "Agarwal", "Joshi", "Malhotra", "Kapoor", "Reddy", "Nair", "Iyer", "Menon",
        "Rao", "Das", "Bose", "Chatterjee", "Mukherjee", "Ghosh", "Banerjee", "Roy"
    };

    private static final String[] CITIES = {
        "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata",
        "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore"
    };

    private static final String[] PRODUCTS = {
        "Premium Kurta Set", "Designer Saree", "Casual T-Shirt Bundle", "Formal Suit",
        "Ethnic Lehenga", "Cotton Kurti", "Denim Jeans Pack", "Silk Dupatta",
        "Festive Collection", "Winter Jacket", "Traditional Sherwani", "Party Dress",
        "Comfort Sandals", "Ethnic Footwear", "Handbag Collection", "Sunglasses Set",
        "Jewelry Set", "Watch Collection", "Perfume Bundle", "Skincare Kit"
    };

    private static final String[] CATEGORIES = {
        "Ethnic Wear", "Western Wear", "Casual", "Formal", "Accessories", "Footwear",
        "Beauty", "Festive"
    };

    @Bean
    CommandLineRunner seedData(
            CustomerRepository customerRepository,
            OrderRepository orderRepository,
            SegmentRepository segmentRepository,
            CampaignRepository campaignRepository) {

        return args -> {
            if (customerRepository.count() > 0) {
                return; // Already seeded
            }

            Random random = new Random(42); // Fixed seed for reproducibility

            System.out.println("🌱 Seeding demo data...");

            // Create 200 customers
            Customer[] customers = new Customer[200];
            for (int i = 0; i < 200; i++) {
                String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
                String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
                String name = firstName + " " + lastName;
                String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@example.com";
                String phone = "+91" + (9000000000L + random.nextInt(999999999));
                String city = CITIES[random.nextInt(CITIES.length)];

                Customer customer = new Customer(name, email, phone, city, "India");

                // Assign customer type with tags
                double spendTier = random.nextDouble();
                if (spendTier > 0.9) {
                    customer.setTags("vip,loyal");
                    customer.setTotalSpend(5000 + random.nextDouble() * 15000);
                    customer.setOrderCount(15 + random.nextInt(30));
                    customer.setLastPurchaseDate(LocalDate.now().minusDays(random.nextInt(15)));
                } else if (spendTier > 0.7) {
                    customer.setTags("loyal");
                    customer.setTotalSpend(2000 + random.nextDouble() * 5000);
                    customer.setOrderCount(6 + random.nextInt(10));
                    customer.setLastPurchaseDate(LocalDate.now().minusDays(random.nextInt(20)));
                } else if (spendTier > 0.5) {
                    customer.setTags("regular");
                    customer.setTotalSpend(500 + random.nextDouble() * 2000);
                    customer.setOrderCount(2 + random.nextInt(6));
                    customer.setLastPurchaseDate(LocalDate.now().minusDays(20 + random.nextInt(40)));
                } else if (spendTier > 0.3) {
                    customer.setTags("at-risk");
                    customer.setTotalSpend(200 + random.nextDouble() * 500);
                    customer.setOrderCount(1 + random.nextInt(3));
                    customer.setLastPurchaseDate(LocalDate.now().minusDays(40 + random.nextInt(60)));
                } else {
                    customer.setTags("churned");
                    customer.setTotalSpend(50 + random.nextDouble() * 200);
                    customer.setOrderCount(1);
                    customer.setLastPurchaseDate(LocalDate.now().minusDays(90 + random.nextInt(180)));
                }

                customers[i] = customerRepository.save(customer);
            }

            // Create ~800 orders spread across customers
            for (int i = 0; i < 800; i++) {
                Customer customer = customers[random.nextInt(200)];
                String product = PRODUCTS[random.nextInt(PRODUCTS.length)];
                String category = CATEGORIES[random.nextInt(CATEGORIES.length)];
                double amount = 200 + random.nextDouble() * 3000;
                LocalDate purchaseDate = customer.getLastPurchaseDate() != null
                        ? customer.getLastPurchaseDate().minusDays(random.nextInt(60))
                        : LocalDate.now().minusDays(random.nextInt(90));

                Order order = new Order(customer, product, category, Math.round(amount * 100.0) / 100.0, purchaseDate);
                orderRepository.save(order);
            }

            // Seed default segments
            Segment vipSegment = new Segment(
                    "VIP Customers",
                    "High-value customers with total spend over ₹5,000",
                    "{\"operator\":\"AND\",\"conditions\":[{\"field\":\"totalSpend\",\"op\":\"gte\",\"value\":5000}]}"
            );
            vipSegment.setCustomerCount(20);
            segmentRepository.save(vipSegment);

            Segment atRiskSegment = new Segment(
                    "At-Risk Customers",
                    "Customers who haven't purchased in 30+ days",
                    "{\"operator\":\"AND\",\"conditions\":[{\"field\":\"daysSinceLastPurchase\",\"op\":\"gte\",\"value\":30}]}"
            );
            atRiskSegment.setCustomerCount(80);
            segmentRepository.save(atRiskSegment);

            Segment loyalSegment = new Segment(
                    "Loyal Shoppers",
                    "Customers with 5+ orders and spend over ₹2,000",
                    "{\"operator\":\"AND\",\"conditions\":[{\"field\":\"orderCount\",\"op\":\"gte\",\"value\":5},{\"field\":\"totalSpend\",\"op\":\"gte\",\"value\":2000}]}"
            );
            loyalSegment.setCustomerCount(40);
            segmentRepository.save(loyalSegment);

            Segment mumbaiSegment = new Segment(
                    "Mumbai Customers",
                    "All customers based in Mumbai",
                    "{\"operator\":\"AND\",\"conditions\":[{\"field\":\"city\",\"op\":\"eq\",\"value\":\"Mumbai\"}]}"
            );
            mumbaiSegment.setCustomerCount(25);
            segmentRepository.save(mumbaiSegment);

            System.out.println("✅ Seeded 200 customers, 800 orders, 4 segments");
        };
    }
}
