package com.xeno.agent.repository;

import com.xeno.agent.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByPurchasedAtDesc(Long customerId);

    @Query("SELECT SUM(o.amount) FROM Order o WHERE o.customer.id = :customerId")
    Double sumAmountByCustomerId(@Param("customerId") Long customerId);

    long countByCustomerId(Long customerId);
}
