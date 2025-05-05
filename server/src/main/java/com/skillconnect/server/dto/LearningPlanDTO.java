package com.skillconnect.server.dto;

import com.skillconnect.server.model.LearningPlan;
import com.skillconnect.server.model.LearningPlanItem;
import com.skillconnect.server.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningPlanDTO {

    private int planId;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private double status;
    private User user;
    private List<LearningPlanItem> items = new ArrayList<>();

    public LearningPlan DTOToLearningPlan(User user) {
        LearningPlan learningPlan = new LearningPlan();
        learningPlan.setTitle(title);
        learningPlan.setDescription(description);
        learningPlan.setStartDate(startDate);
        learningPlan.setEndDate(endDate);
        learningPlan.setUser(user);
        return learningPlan;
    }

    public List<LearningPlanItem> DTOToLearningPlanItem(LearningPlan learningPlan) {
        for (LearningPlanItem item : items) {
            item.setLearningPlan(learningPlan);
        }
        return items;
    }

    public LearningPlanDTO EntityToDTO(LearningPlan learningPlan, List<LearningPlanItem> learningPlanItems, double status) {

        LearningPlanDTO learningPlanDTO = new LearningPlanDTO();
        learningPlanDTO.setPlanId(learningPlan.getPlanId());
        learningPlanDTO.setTitle(learningPlan.getTitle());
        learningPlanDTO.setDescription(learningPlan.getDescription());
        learningPlanDTO.setStartDate(learningPlan.getStartDate());
        learningPlanDTO.setEndDate(learningPlan.getEndDate());
        learningPlanDTO.setStatus(status);
        learningPlanDTO.setUser(learningPlan.getUser());
        learningPlanDTO.setItems(learningPlanItems);
        return learningPlanDTO;
    }

}
