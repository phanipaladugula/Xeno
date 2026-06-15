package com.xeno.agent.repository;

import com.xeno.agent.model.Segment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SegmentRepository extends JpaRepository<Segment, Long> {
    List<Segment> findAllByOrderByCreatedAtDesc();
    boolean existsByName(String name);
}
