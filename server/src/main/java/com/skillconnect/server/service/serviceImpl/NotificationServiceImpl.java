package com.skillconnect.server.service.serviceImpl;

import com.skillconnect.server.model.Notification;
import com.skillconnect.server.model.User;
import com.skillconnect.server.repository.NotificationRepository;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.log4j.Log4j2;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Log4j2
@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        log.info("NotificationServiceImpl initialized");
    }
    
    @Override
    public Notification createNotification(Notification notification) {
        log.info("Creating notification for user ID: {}", notification.getUser().getUserId());
        
        User user = userRepository.findById(notification.getUser().getUserId())
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", notification.getUser().getUserId());
                    return new RuntimeException("User not found with id: " + notification.getUser().getUserId());
                });
        
        notification.setUser(user);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification created successfully with ID: {}", savedNotification.getNotificationId());
        return savedNotification;
    }
    
    @Override
    public Optional<Notification> findById(int notificationId) {
        log.debug("Finding notification by ID: {}", notificationId);
        return notificationRepository.findById(notificationId);
    }
    
    @Override
    public List<Notification> findNotificationsByUserId(int userId) {
        log.debug("Finding notifications for user ID: {}", userId);
        List<Notification> notifications = notificationRepository.findByUser_UserId(userId);
        log.debug("Found {} notifications for user ID: {}", notifications.size(), userId);
        return notifications;
    }
    
    @Override
    public List<Notification> findUnreadNotificationsByUserId(int userId) {
        log.debug("Finding unread notifications for user ID: {}", userId);
        List<Notification> unreadNotifications = notificationRepository.findByUser_UserIdAndIsReadFalse(userId);
        log.debug("Found {} unread notifications for user ID: {}", unreadNotifications.size(), userId);
        return unreadNotifications;
    }
    
    @Override
    public void markAsRead(int notificationId) {
        log.info("Marking notification ID: {} as read", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.error("Notification not found with ID: {}", notificationId);
                    return new RuntimeException("Notification not found with id: " + notificationId);
                });
        
        notification.setIsRead(true);
        
        notificationRepository.save(notification);
        log.info("Notification marked as read: {}", notificationId);
    }
    
    @Override
    public void markAllAsRead(int userId) {
        log.info("Marking all notifications as read for user ID: {}", userId);
        
        List<Notification> unreadNotifications = notificationRepository.findByUser_UserIdAndIsReadFalse(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        
        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read for user ID: {}", unreadNotifications.size(), userId);
    }
    
    @Override
    public void deleteNotification(int notificationId) {
        log.info("Deleting notification with ID: {}", notificationId);
        notificationRepository.deleteById(notificationId);
        log.info("Notification deleted successfully: {}", notificationId);
    }
    
    @Override
    public void deleteAllNotifications(int userId) {
        log.info("Deleting all notifications for user ID: {}", userId);
        notificationRepository.deleteByUser_UserId(userId);
        log.info("All notifications deleted for user ID: {}", userId);
    }
}
