package com.skillconnect.server.controller;

import com.skillconnect.server.model.AdminMessage;
import com.skillconnect.server.service.AdminMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin-messages")
public class AdminMessageController {

    private final AdminMessageService adminMessageService;

    @Autowired
    public AdminMessageController(AdminMessageService adminMessageService) {
        this.adminMessageService = adminMessageService;
    }

    @PostMapping
    public ResponseEntity<AdminMessage> createMessage(@RequestBody AdminMessage message) {
        AdminMessage created = adminMessageService.createMessage(message);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminMessage> getMessageById(@PathVariable int id) {
        return adminMessageService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<AdminMessage>> getAllMessages() {
        return ResponseEntity.ok(adminMessageService.findAllMessages());
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<AdminMessage>> getMessagesByAdminId(@PathVariable int adminId) {

        return ResponseEntity.ok(adminMessageService.findMessagesByAdminId(adminId));
    }

    @PutMapping
    public ResponseEntity<AdminMessage> updateMessage(@RequestBody AdminMessage adminMessage) {
        return ResponseEntity.ok(adminMessageService.updateMessage(adminMessage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable int id) {
        adminMessageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}

