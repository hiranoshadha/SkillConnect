package com.skillconnect.server.service;

import com.skillconnect.server.model.Like;

import java.util.List;

public interface LikeService {
    
    Like likePost(int postId, int userId);
    
    void unlikePost(int postId, int userId);
    
    List<Like> findLikesByPostId(int postId);
}
