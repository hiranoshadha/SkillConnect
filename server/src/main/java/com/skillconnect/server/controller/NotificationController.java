package com.skillconnect.server.controller;

import com.skillconnect.server.model.Notification;
import com.skillconnect.server.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Log4j2
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{notificationId}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable int notificationId) {
        log.info("REST request to get notification by ID: {}", notificationId);
        return notificationService.findById(notificationId)
                .map(notification -> new ResponseEntity<>(notification, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable int userId) {
        log.info("REST request to get notifications by user ID: {}", userId);
        List<Notification> notifications = notificationService.findNotificationsByUserId(userId);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotificationsByUserId(@PathVariable int userId) {
        log.info("REST request to get unread notifications by user ID: {}", userId);
        List<Notification> notifications = notificationService.findUnreadNotificationsByUserId(userId);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable int notificationId) {
        log.info("REST request to mark notification as read: {}", notificationId);
        notificationService.markAsRead(notificationId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable int userId) {
        log.info("REST request to mark all notifications as read for user ID: {}", userId);
        notificationService.markAllAsRead(userId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable int notificationId) {
        log.info("REST request to delete notification with ID: {}", notificationId);
        notificationService.deleteNotification(notificationId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteAllNotifications(@PathVariable int userId) {
        log.info("REST request to delete all notifications for user ID: {}", userId);
        notificationService.deleteAllNotifications(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
