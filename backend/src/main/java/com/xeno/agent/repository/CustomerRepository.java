package com.xeno.agent.repository;

import com.xeno.agent.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Page<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:minSpend IS NULL OR c.totalSpend >= :minSpend) AND " +
           "(:maxSpend IS NULL OR c.totalSpend <= :maxSpend) AND " +
           "(:city IS NULL OR LOWER(c.city) = LOWER(:city)) AND " +
           "(:lastPurchaseBefore IS NULL OR c.lastPurchaseDate < :lastPurchaseBefore) AND " +
           "(:lastPurchaseAfter IS NULL OR c.lastPurchaseDate >= :lastPurchaseAfter) AND " +
           "(:minOrders IS NULL OR c.orderCount >= :minOrders) AND " +
           "(:tag IS NULL OR c.tags LIKE %:tag%)")
    List<Customer> findByFilters(
            @Param("minSpend") Double minSpend,
            @Param("maxSpend") Double maxSpend,
            @Param("city") String city,
            @Param("lastPurchaseBefore") LocalDate lastPurchaseBefore,
            @Param("lastPurchaseAfter") LocalDate lastPurchaseAfter,
            @Param("minOrders") Integer minOrders,
            @Param("tag") String tag);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.lastPurchaseDate >= :since")
    long countActiveAfter(@Param("since") LocalDate since);

    @Query("SELECT SUM(c.totalSpend) FROM Customer c")
    Double sumTotalRevenue();

    long count();
}
