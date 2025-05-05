package com.skillconnect.server.service;

import com.skillconnect.server.dto.LearningPlanDTO;
import com.skillconnect.server.model.LearningPlan;
import com.skillconnect.server.model.LearningPlanItem;

import java.util.List;

public interface LearningPlanService {
    
    LearningPlan createLearningPlan(LearningPlanDTO dto);
    
    LearningPlanDTO findById(int planId);
    
    List<LearningPlanDTO> findLearningPlansByUserId(int userId);
    
    LearningPlan updateLearningPlan(LearningPlan learningPlan);
    
    void deleteLearningPlan(int planId);

    void removeItemFromPlan(int itemId);

    LearningPlanItem addItemToPlan(LearningPlanItem item, int planId);

    double calculateStatus(List<LearningPlanItem> items);
}
