package com.skillconnect.server.service;

import com.skillconnect.server.model.Comment;

import java.util.List;
import java.util.Optional;

public interface CommentService {
    
    Comment createComment(Comment comment);
    
    Optional<Comment> findById(int commentId);
    
    List<Comment> findCommentsByPostId(int postId);
    
    List<Comment> findCommentsByUserId(int id);
    
    Comment updateComment(Comment comment);
    
    void deleteComment(int commentId);
}
