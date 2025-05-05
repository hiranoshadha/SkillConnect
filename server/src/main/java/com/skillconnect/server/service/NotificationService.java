package com.skillconnect.server.service;

import com.skillconnect.server.model.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationService {
    
    Notification createNotification(Notification notification);

    List<Notification> findUnreadNotificationsByUserId(int userId);

    void deleteAllNotifications(int userId);
    
    Optional<Notification> findById(int notificationId);
    
    List<Notification> findNotificationsByUserId(int userId);
    
    void markAsRead(int notificationId);
    
    void markAllAsRead(int userId);
    
    void deleteNotification(int notificationId);
}
