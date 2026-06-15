package com.xeno.agent.controller;

import com.xeno.agent.model.Segment;
import com.xeno.agent.service.SegmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/segments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:4173"})
public class SegmentController {

    private final SegmentService segmentService;

    public SegmentController(SegmentService segmentService) {
        this.segmentService = segmentService;
    }

    @GetMapping
    public ResponseEntity<?> getAllSegments() {
        return ResponseEntity.ok(segmentService.getAllSegments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSegment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(segmentService.getSegmentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createSegment(@RequestBody Segment segment) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(segmentService.createSegment(segment));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSegment(@PathVariable Long id, @RequestBody Segment segment) {
        try {
            return ResponseEntity.ok(segmentService.updateSegment(id, segment));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSegment(@PathVariable Long id) {
        try {
            segmentService.deleteSegment(id);
            return ResponseEntity.ok(Map.of("message", "Segment deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/preview")
    public ResponseEntity<?> previewSegment(@RequestBody Map<String, String> body) {
        try {
            String rulesJson = body.get("rules");
            int count = segmentService.previewSegment(rulesJson);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/customers")
    public ResponseEntity<?> getSegmentCustomers(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(segmentService.getCustomersInSegment(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
