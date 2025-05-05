package com.skillconnect.server.service;

import com.skillconnect.server.model.AdminMessage;

import java.util.List;
import java.util.Optional;

public interface AdminMessageService {
    
    AdminMessage createMessage(AdminMessage message);
    
    Optional<AdminMessage> findById(int id);
    
    List<AdminMessage> findAllMessages();
    
    List<AdminMessage> findMessagesByAdminId(int id);
    
    AdminMessage updateMessage(AdminMessage adminMessage);
    
    void deleteMessage(int messageId);
}
