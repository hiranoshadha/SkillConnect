package com.skillconnect.server.repository;

import com.skillconnect.server.model.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningPlanRepository extends JpaRepository<LearningPlan, Integer> {
    List<LearningPlan> findByUser_UserId(Integer userId);
    // List<LearningPlan> findByStatus(String status);
    // List<LearningPlan> findByPostId(int postId);
}
