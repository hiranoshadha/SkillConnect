package com.skillconnect.server.repository;

import com.skillconnect.server.model.Comment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByPost_PostId(int postId);
    List<Comment> findByUser_UserId(int userId);
    void deleteByPost_PostId(int postId);
}
