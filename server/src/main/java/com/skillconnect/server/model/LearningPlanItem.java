package com.skillconnect.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "LearningPlanItems")
public class LearningPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private int itemId;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private LearningPlan learningPlan;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "is_complete", nullable = false)
    private boolean isComplete = false;

}
