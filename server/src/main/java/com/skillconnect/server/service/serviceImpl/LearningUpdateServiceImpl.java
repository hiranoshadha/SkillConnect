package com.skillconnect.server.service.serviceImpl;

import com.skillconnect.server.model.LearningUpdate;
import com.skillconnect.server.model.User;
import com.skillconnect.server.repository.LearningUpdateRepository;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.LearningUpdateService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Log4j2
@Transactional
public class LearningUpdateServiceImpl implements LearningUpdateService {

    private final LearningUpdateRepository learningUpdateRepository;
    private final UserRepository userRepository;

    @Autowired
    public LearningUpdateServiceImpl(LearningUpdateRepository learningUpdateRepository, UserRepository userRepository) {
        this.learningUpdateRepository = learningUpdateRepository;
        this.userRepository = userRepository;
    }

    @Override
    public LearningUpdate saveLearningUpdate(LearningUpdate learningUpdate) {
        log.info("Saving new learning update for user ID: {}", learningUpdate.getUser().getUserId());

        // Set creation time if not already set
        if (learningUpdate.getCreatedAt() == null) {
            learningUpdate.setCreatedAt(LocalDateTime.now());
        }
        
        // Set update time
        learningUpdate.setUpdatedAt(LocalDateTime.now());

        LearningUpdate savedUpdate = learningUpdateRepository.save(learningUpdate);
        log.info("Learning update saved successfully with ID: {}", savedUpdate.getUpdateId());
        return savedUpdate;
    }

    @Override
    public Optional<LearningUpdate> findById(int updateId) {
        log.debug("Finding learning update by ID: {}", updateId);
        return learningUpdateRepository.findById(updateId);
    }

    @Override
    public List<LearningUpdate> findAllLearningUpdates() {
        log.debug("Retrieving all learning updates");
        List<LearningUpdate> updates = learningUpdateRepository.findAll();
        log.debug("Found {} learning updates", updates.size());
        return updates;
    }

    @Override
    public List<LearningUpdate> findByUserId(int userId) {
        log.debug("Finding learning updates for user ID: {}", userId);
        List<LearningUpdate> updates = learningUpdateRepository.findByUser_UserId(userId);
        log.debug("Found {} learning updates for user ID: {}", updates.size(), userId);
        return updates;
    }

    @Override
    public LearningUpdate updateLearningUpdate(LearningUpdate learningUpdate) {
        log.info("Updating learning update with ID: {}", learningUpdate.getUpdateId());
        if (!learningUpdateRepository.existsById(learningUpdate.getUpdateId())) {
            log.error("Learning update not found with ID: {}", learningUpdate.getUpdateId());
            throw new RuntimeException("Learning update not found with id: " + learningUpdate.getUpdateId());
        }

        // Set update time
        learningUpdate.setUpdatedAt(LocalDateTime.now());
        
        LearningUpdate updatedLearningUpdate = learningUpdateRepository.save(learningUpdate);
        log.info("Learning update updated successfully: {}", learningUpdate.getUpdateId());
        return updatedLearningUpdate;
    }

    @Override
    public void deleteLearningUpdate(int updateId) {
        log.info("Deleting learning update with ID: {}", updateId);
        learningUpdateRepository.deleteById(updateId);
        log.info("Learning update deleted successfully: {}", updateId);
    }

    @Override
    public List<LearningUpdate> findByCategory(String category) {
        log.debug("Finding learning updates by category: {}", category);
        List<LearningUpdate> updates = learningUpdateRepository.findByCategory(category);
        log.debug("Found {} learning updates for category: {}", updates.size(), category);
        return updates;
    }

    @Override
    public List<LearningUpdate> findByType(String type) {
        log.debug("Finding learning updates by type: {}", type);
        List<LearningUpdate> updates = learningUpdateRepository.findByType(type);
        log.debug("Found {} learning updates for type: {}", updates.size(), type);
        return updates;
    }

    @Override
    public List<LearningUpdate> findByLevel(String level) {
        log.debug("Finding learning updates by level: {}", level);
        List<LearningUpdate> updates = learningUpdateRepository.findByLevel(level);
        log.debug("Found {} learning updates for level: {}", updates.size(), level);
        return updates;
    }
    
    @Override
    public List<LearningUpdate> findByStatus(String status) {
        log.debug("Finding learning updates by status: {}", status);
        List<LearningUpdate> updates = learningUpdateRepository.findByStatus(status);
        log.debug("Found {} learning updates for status: {}", updates.size(), status);
        return updates;
    }

    @Override
    public List<LearningUpdate> findByUserIdAndStatus(int userId, String status) {
        log.debug("Finding learning updates for user ID: {} with status: {}", userId, status);
        List<LearningUpdate> updates = learningUpdateRepository.findByUser_UserIdAndStatus(userId, status);
        log.debug("Found {} learning updates", updates.size());
        return updates;
    }

    @Override
    public List<LearningUpdate> findByUserIdAndCategory(int userId, String category) {
        log.debug("Finding learning updates for user ID: {} with category: {}", userId, category);
        List<LearningUpdate> updates = learningUpdateRepository.findByUser_UserIdAndCategory(userId, category);
        log.debug("Found {} learning updates", updates.size());
        return updates;
    }

    @Override
    public List<LearningUpdate> findByUserIdAndType(int userId, String type) {
        log.debug("Finding learning updates for user ID: {} with type: {}", userId, type);
        List<LearningUpdate> updates = learningUpdateRepository.findByUser_UserIdAndType(userId, type);
        log.debug("Found {} learning updates", updates.size());
        return updates;
    }

    @Override
    public LearningUpdate createFromTemplate(String templateType, int userId) {
        log.info("Creating learning update from template: {} for user ID: {}", templateType, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        LearningUpdate update = new LearningUpdate();
        update.setUser(user);
        update.setCreatedAt(LocalDateTime.now());
        update.setUpdatedAt(LocalDateTime.now());
        
        switch (templateType) {
            case "TUTORIAL":
                update.setTitle("Complete Online Tutorial");
                update.setType("Tutorial");
                update.setCategory("Online Learning");
                update.setLearningMethod("Video Tutorial");
                update.setLevel("Beginner");
                update.setStatus("Not Started");
                update.setCompletionPercentage(0);
                break;
            case "CERTIFICATE":
                update.setTitle("Complete Certification Course");
                update.setType("Certification");
                update.setCategory("Professional Development");
                update.setLearningMethod("Online Course");
                update.setLevel("Intermediate");
                update.setStatus("Not Started");
                update.setCompletionPercentage(0);
                break;
            case "EXAM":
                update.setTitle("Pass Certification Exam");
                update.setType("Exam");
                update.setCategory("Assessment");
                update.setLearningMethod("Examination");
                update.setLevel("Advanced");
                update.setStatus("Not Started");
                update.setCompletionPercentage(0);
                break;
            case "PROJECT":
                update.setTitle("Complete Practice Project");
                update.setType("Project");
                update.setCategory("Hands-on Learning");
                update.setLearningMethod("Project-based");
                update.setLevel("Intermediate");
                update.setStatus("Not Started");
                update.setCompletionPercentage(0);
                break;
            default:
                update.setTitle("Custom Learning Update");
                update.setType("Custom");
                update.setStatus("Not Started");
                update.setCompletionPercentage(0);
        }
        
        return learningUpdateRepository.save(update);
    }

    @Override
    public LearningUpdate updateStatus(int updateId, String status, Integer completionPercentage) {
        log.info("Updating status for learning update ID: {} to {}", updateId, status);
        
        LearningUpdate update = learningUpdateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Learning update not found with ID: " + updateId));
        
        update.setStatus(status);
        update.setUpdatedAt(LocalDateTime.now());
        
        if (completionPercentage != null) {
            update.setCompletionPercentage(completionPercentage);
        } else {
            // Set default percentage based on status
            switch (status) {
                case "Not Started":
                    update.setCompletionPercentage(0);
                    break;
                case "In Progress":
                    update.setCompletionPercentage(25);
                    break;
                case "Ongoing":
                    update.setCompletionPercentage(50);
                    break;
                case "Almost Complete":
                    update.setCompletionPercentage(75);
                    break;
                case "Completed":
                    update.setCompletionPercentage(100);
                    break;
                default:
                    // Keep existing percentage
            }
        }
        
        return learningUpdateRepository.save(update);
    }
}
