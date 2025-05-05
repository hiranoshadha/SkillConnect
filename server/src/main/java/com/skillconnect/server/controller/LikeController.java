package com.skillconnect.server.controller;

import com.skillconnect.server.model.Like;
import com.skillconnect.server.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;

    @Autowired
    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{postId}/user/{userId}")
    public ResponseEntity<Like> likePost(@PathVariable int postId, @PathVariable int userId) {
        Like like = likeService.likePost(postId, userId);
        return ResponseEntity.ok(like);
    }

    @DeleteMapping("/{postId}/user/{userId}")
    public ResponseEntity<Void> unlikePost(@PathVariable int postId, @PathVariable int userId) {
        likeService.unlikePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<Like>> getLikesByPostId(@PathVariable int postId) {
        List<Like> likes = likeService.findLikesByPostId(postId);
        return ResponseEntity.ok(likes);
    }
}

