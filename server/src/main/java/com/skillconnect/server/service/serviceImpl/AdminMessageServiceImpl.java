package com.skillconnect.server.service.serviceImpl;

import com.skillconnect.server.model.AdminMessage;
import com.skillconnect.server.model.User;
import com.skillconnect.server.repository.AdminMessageRepository;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.AdminMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.log4j.Log4j2;

import java.util.List;
import java.util.Optional;

@Log4j2
@Service
@Transactional
public class AdminMessageServiceImpl implements AdminMessageService {

    private final AdminMessageRepository adminMessageRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public AdminMessageServiceImpl(
            AdminMessageRepository adminMessageRepository,
            UserRepository userRepository) {
        this.adminMessageRepository = adminMessageRepository;
        this.userRepository = userRepository;
        log.info("AdminMessageServiceImpl initialized");
    }
    
    @Override
    public AdminMessage createMessage(AdminMessage message) {
        log.info("Creating new admin message by admin ID: {}", message.getAdmin().getUserId());
        
        User admin = userRepository.findById(message.getAdmin().getUserId())
                .orElseThrow(() -> {
                    log.error("Admin user not found with ID: {}", message.getAdmin().getUserId());
                    return new RuntimeException("Admin user not found with id: " + message.getAdmin().getUserId());
                });
        
        // Verify the user is an admin (assuming there's a role field)
        if (!admin.getRole().equals("ADMIN")) {
            log.error("User with ID: {} is not an admin", message.getAdmin().getUserId());
            throw new RuntimeException("User is not authorized to create admin messages");
        }
        
        message.setAdmin(admin);
        // The @PrePersist will handle setting createdAt
        
        AdminMessage savedMessage = adminMessageRepository.save(message);
        log.info("Admin message created successfully with ID: {}", savedMessage.getMessageId());
        return savedMessage;
    }
    
    @Override
    public Optional<AdminMessage> findById(int id) {
        log.debug("Finding admin message by ID: {}", id);
        return adminMessageRepository.findById(id);
    }
    
    @Override
    public List<AdminMessage> findAllMessages() {
        log.debug("Retrieving all admin messages");
        List<AdminMessage> messages = adminMessageRepository.findAll();
        log.debug("Found {} admin messages", messages.size());
        return messages;
    }
    
    @Override
    public List<AdminMessage> findMessagesByAdminId(int id) {
        log.debug("Finding admin messages by admin ID: {}", id);
        List<AdminMessage> messages = adminMessageRepository.findByAdmin_UserId(id);
        log.debug("Found {} messages by admin ID: {}", messages.size(), id);
        return messages;
    }
    
    @Override
    public AdminMessage updateMessage(AdminMessage message) {
        log.info("Updating admin message with ID: {}", message.getMessageId());
        if (!adminMessageRepository.existsById(message.getMessageId())) {
            log.error("Admin message not found with ID: {}", message.getMessageId());
            throw new RuntimeException("Admin message not found with id: " + message.getMessageId());
        }
        
        AdminMessage updatedMessage = adminMessageRepository.save(message);
        log.info("Admin message updated successfully: {}", message.getMessageId());
        return updatedMessage;
    }
    
    @Override
    public void deleteMessage(int messageId) {
        log.info("Deleting admin message with ID: {}", messageId);
        adminMessageRepository.deleteById(messageId);
        log.info("Admin message deleted successfully: {}", messageId);
    }
    
}
