package com.skillconnect.server.service;

import com.skillconnect.server.model.LearningUpdate;

import java.util.List;
import java.util.Optional;

public interface LearningUpdateService {
    LearningUpdate saveLearningUpdate(LearningUpdate learningUpdate);

    Optional<LearningUpdate> findById(int updateId);

    List<LearningUpdate> findAllLearningUpdates();

    List<LearningUpdate> findByUserId(int userId);

    LearningUpdate updateLearningUpdate(LearningUpdate learningUpdate);

    void deleteLearningUpdate(int updateId);

    List<LearningUpdate> findByCategory(String category);

    List<LearningUpdate> findByType(String type);

    List<LearningUpdate> findByLevel(String level);
    
    // New methods
    List<LearningUpdate> findByStatus(String status);
    
    List<LearningUpdate> findByUserIdAndStatus(int userId, String status);
    
    List<LearningUpdate> findByUserIdAndCategory(int userId, String category);
    
    List<LearningUpdate> findByUserIdAndType(int userId, String type);
    
    LearningUpdate createFromTemplate(String templateType, int userId);
    
    LearningUpdate updateStatus(int updateId, String status, Integer completionPercentage);
}
