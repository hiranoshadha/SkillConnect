package com.skillconnect.server.service.serviceImpl;

import com.skillconnect.server.model.LearningPlan;
import com.skillconnect.server.model.LearningPlanItem;
import com.skillconnect.server.repository.LearningPlanItemRepository;
import com.skillconnect.server.repository.LearningPlanRepository;
import com.skillconnect.server.service.LearningPlanItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.log4j.Log4j2;

import java.util.List;
import java.util.Optional;

@Log4j2
@Service
@Transactional
public class LearningPlanItemServiceImpl implements LearningPlanItemService {

    private final LearningPlanItemRepository learningPlanItemRepository;
    private final LearningPlanRepository learningPlanRepository;
    
    @Autowired
    public LearningPlanItemServiceImpl(
            LearningPlanItemRepository learningPlanItemRepository,
            LearningPlanRepository learningPlanRepository) {
        this.learningPlanItemRepository = learningPlanItemRepository;
        this.learningPlanRepository = learningPlanRepository;
        log.info("LearningPlanItemServiceImpl initialized");
    }
    
    @Override
    public LearningPlanItem createItem(LearningPlanItem item) {
        log.info("Creating new learning plan item for plan ID: {}", item.getLearningPlan().getPlanId());
        
        LearningPlan plan = learningPlanRepository.findById(item.getLearningPlan().getPlanId())
                .orElseThrow(() -> {
                    log.error("Learning plan not found with ID: {}", item.getLearningPlan().getPlanId());
                    return new RuntimeException("Learning plan not found with id: " + item.getLearningPlan().getPlanId());
                });
        
        item.setLearningPlan(plan);
        // The @PrePersist will handle setting createdAt and updatedAt
        
        LearningPlanItem savedItem = learningPlanItemRepository.save(item);
        log.info("Learning plan item created successfully with ID: {}", savedItem.getItemId());
        return savedItem;
    }
    
    @Override
    public Optional<LearningPlanItem> findById(int itemId) {
        log.debug("Finding learning plan item by ID: {}", itemId);
        return learningPlanItemRepository.findById(itemId);
    }
    
    @Override
    public List<LearningPlanItem> findItemsByPlanId(int planId) {
        log.debug("Finding learning plan items for plan ID: {}", planId);
        List<LearningPlanItem> items = learningPlanItemRepository.findByLearningPlan_PlanId(planId);
        log.debug("Found {} items for plan ID: {}", items.size(), planId);
        return items;
    }
    
    @Override
    public LearningPlanItem updateItem(LearningPlanItem item) {
        log.info("Updating learning plan item with ID: {}", item.getItemId());
        if (!learningPlanItemRepository.existsById(item.getItemId())) {
            log.error("Learning plan item not found with ID: {}", item.getItemId());
            throw new RuntimeException("Learning plan item not found with id: " + item.getItemId());
        }

        LearningPlanItem updatedItem = learningPlanItemRepository.save(item);
        log.info("Learning plan item updated successfully: {}", item.getItemId());
        return updatedItem;
    }
    
    @Override
    public void deleteItem(int itemId) {
        log.info("Deleting learning plan item with ID: {}", itemId);
        learningPlanItemRepository.deleteById(itemId);
        log.info("Learning plan item deleted successfully: {}", itemId);
    }
    
    @Override
    public LearningPlanItem markItemAsCompleted(int itemId) {
        log.info("Marking learning plan item ID: {} as completed", itemId);
        
        LearningPlanItem item = learningPlanItemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.error("Learning plan item not found with ID: {}", itemId);
                    return new RuntimeException("Learning plan item not found with id: " + itemId);
                });
        
        item.setComplete(true);
        
        LearningPlanItem updatedItem = learningPlanItemRepository.save(item);
        log.info("Learning plan item marked as completed: {}", itemId);
        return updatedItem;
    }

}
