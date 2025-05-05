package com.skillconnect.server.repository;

import com.skillconnect.server.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserId(int id);
    List<Notification> findByUser_UserIdAndIsReadFalse(int id);
    void deleteByUser_UserId(int id);
}
