package com.skillconnect.server.repository;

import com.skillconnect.server.model.LearningPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningPlanItemRepository extends JpaRepository<LearningPlanItem, Integer> {
    List<LearningPlanItem> findByLearningPlan_PlanId(int learningPlanId);
    void deleteByLearningPlan_PlanId(int learningPlanId);
    // List<LearningPlanItem> findByLearningPlanIdOrderByOrderIndexAsc(int learningPlanId);
}
