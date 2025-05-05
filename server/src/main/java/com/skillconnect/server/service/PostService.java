package com.skillconnect.server.service;

import com.skillconnect.server.model.Post;

import java.util.List;
import java.util.Optional;

public interface PostService {

    Post createPost(Post post);
    
    Optional<Post> findById(int postId);
    
    List<Post> findAllPosts();
    
    List<Post> findPostsByUserId(int userId);
    
    Post updatePost(Post post);
    
    void deletePost(int postId);

    List<Post> loadFeed(int userId);
}
