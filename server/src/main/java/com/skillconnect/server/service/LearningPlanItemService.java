package com.skillconnect.server.service;

import com.skillconnect.server.model.LearningPlanItem;

import java.util.List;
import java.util.Optional;

public interface LearningPlanItemService {
    
    LearningPlanItem createItem(LearningPlanItem learningPlanItem);
    Optional<LearningPlanItem> findById(int itemId);
    List<LearningPlanItem> findItemsByPlanId(int planId);
    void deleteItem(int itemId);
    LearningPlanItem updateItem(LearningPlanItem item) ;
    LearningPlanItem markItemAsCompleted(int itemId);
}
