package com.skillconnect.server.controller;

import com.skillconnect.server.model.LearningUpdate;
import com.skillconnect.server.service.LearningUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-updates")
@RequiredArgsConstructor
public class LearningUpdateController {

    private final LearningUpdateService learningUpdateService;

    @PostMapping
    public ResponseEntity<LearningUpdate> createLearningUpdate(@RequestBody LearningUpdate learningUpdate) {
        LearningUpdate savedUpdate = learningUpdateService.saveLearningUpdate(learningUpdate);
        return new ResponseEntity<>(savedUpdate, HttpStatus.CREATED);
    }

    @GetMapping("/{updateId}")
    public ResponseEntity<LearningUpdate> getLearningUpdateById(@PathVariable int updateId) {
        return learningUpdateService.findById(updateId)
                .map(update -> new ResponseEntity<>(update, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<LearningUpdate>> getAllLearningUpdates() {
        List<LearningUpdate> updates = learningUpdateService.findAllLearningUpdates();
        return new ResponseEntity<>(updates, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByUserId(@PathVariable int userId) {
        List<LearningUpdate> updates = learningUpdateService.findByUserId(userId);
        return new ResponseEntity<>(updates, HttpStatus.OK);
    }

    @PutMapping("/{updateId}")
    public ResponseEntity<LearningUpdate> updateLearningUpdate(
            @PathVariable int updateId,
            @RequestBody LearningUpdate learningUpdate) {

        // Ensure the path ID matches the body ID
        if (learningUpdate.getUpdateId() != updateId) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        LearningUpdate updatedUpdate = learningUpdateService.updateLearningUpdate(learningUpdate);
        return new ResponseEntity<>(updatedUpdate, HttpStatus.OK);
    }

    @DeleteMapping("/{updateId}")
    public ResponseEntity<Void> deleteLearningUpdate(@PathVariable int updateId) {
        learningUpdateService.deleteLearningUpdate(updateId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByCategory(@PathVariable String category) {
        List<LearningUpdate> updates = learningUpdateService.findByCategory(category);
        return new ResponseEntity<>(updates, HttpStatus.OK);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByType(@PathVariable String type) {
        List<LearningUpdate> updates = learningUpdateService.findByType(type);
        return new ResponseEntity<>(updates, HttpStatus.OK);
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByLevel(@PathVariable String level) {
        List<LearningUpdate> updates = learningUpdateService.findByLevel(level);
        return new ResponseEntity<>(updates, HttpStatus.OK);
    }

    // Add these endpoints to the existing controller

@GetMapping("/status/{status}")
public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByStatus(@PathVariable String status) {
    List<LearningUpdate> updates = learningUpdateService.findByStatus(status);
    return new ResponseEntity<>(updates, HttpStatus.OK);
}

@GetMapping("/user/{userId}/status/{status}")
public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByUserIdAndStatus(
        @PathVariable int userId, @PathVariable String status) {
    List<LearningUpdate> updates = learningUpdateService.findByUserIdAndStatus(userId, status);
    return new ResponseEntity<>(updates, HttpStatus.OK);
}

@GetMapping("/user/{userId}/category/{category}")
public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByUserIdAndCategory(
        @PathVariable int userId, @PathVariable String category) {
    List<LearningUpdate> updates = learningUpdateService.findByUserIdAndCategory(userId, category);
    return new ResponseEntity<>(updates, HttpStatus.OK);
}

@GetMapping("/user/{userId}/type/{type}")
public ResponseEntity<List<LearningUpdate>> getLearningUpdatesByUserIdAndType(
        @PathVariable int userId, @PathVariable String type) {
    List<LearningUpdate> updates = learningUpdateService.findByUserIdAndType(userId, type);
    return new ResponseEntity<>(updates, HttpStatus.OK);
}

@PostMapping("/template")
public ResponseEntity<LearningUpdate> createFromTemplate(
        @RequestParam String templateType, @RequestParam int userId) {
    LearningUpdate update = learningUpdateService.createFromTemplate(templateType, userId);
    return new ResponseEntity<>(update, HttpStatus.CREATED);
}

@PutMapping("/{updateId}/status")
public ResponseEntity<LearningUpdate> updateStatus(
        @PathVariable int updateId, 
        @RequestParam String status,
        @RequestParam(required = false) Integer completionPercentage) {
    LearningUpdate update = learningUpdateService.updateStatus(updateId, status, completionPercentage);
    return new ResponseEntity<>(update, HttpStatus.OK);
}

}
