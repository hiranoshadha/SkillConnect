package com.skillconnect.server.service.serviceImpl;

import com.skillconnect.server.model.Follow;
import com.skillconnect.server.model.Post;
import com.skillconnect.server.model.User;
import com.skillconnect.server.repository.CommentRepository;
import com.skillconnect.server.repository.LikeRepository;
import com.skillconnect.server.repository.PostRepository;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.FollowService;
import com.skillconnect.server.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.log4j.Log4j2;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Log4j2
@Service
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FollowService followService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Autowired
    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository, FollowService followService, LikeRepository likeRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.followService = followService;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        log.info("PostServiceImpl initialized");
    }

    @Override
    public Post createPost(Post post) {
        log.info("Creating new post for user ID: {}", post.getUser().getUserId());
        User user = userRepository.findById(post.getUser().getUserId())
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", post.getUser().getUserId());
                    return new RuntimeException("User not found with id: " + post.getUser().getUserId());
                });

        post.setUser(user);

        Post savedPost = postRepository.save(post);

        log.info("Post created successfully with ID: {}", savedPost.getPostId());
        return savedPost;
    }

    @Override
    public Optional<Post> findById(int postId) {
        log.debug("Finding post by ID: {}", postId);
        return postRepository.findById(postId);
    }

    @Override
    public List<Post> findPostsByUserId(int userId) {
        log.debug("Finding posts for user ID: {}", userId);
        List<Post> posts = postRepository.findByUser_UserId(userId);
        log.debug("Found {} posts for user ID: {}", posts.size(), userId);
        return posts;
    }

    @Override
    public List<Post> findAllPosts() {
        log.debug("Retrieving all posts");
        List<Post> posts = postRepository.findAll();
        log.debug("Found {} posts", posts.size());
        return posts;
    }

    @Override
    public Post updatePost(Post post) {
        log.info("Updating post with ID: {}", post.getPostId());
        if (!postRepository.existsById(post.getPostId())) {
            log.error("Post not found with ID: {}", post.getPostId());
            throw new RuntimeException("Post not found with id: " + post.getPostId());
        }
        Post updatedPost = postRepository.save(post);
        log.info("Post updated successfully: {}", post.getPostId());
        return updatedPost;
    }

    @Override
    public void deletePost(int postId) {
        log.info("Deleting post with ID: {}", postId);
        commentRepository.deleteByPost_PostId(postId);
        likeRepository.deleteByPost_PostId(postId);
        postRepository.deleteById(postId);
        log.info("Post deleted successfully: {}", postId);
    }

    @Override
    public List<Post> loadFeed(int userId) {
        log.info("Loading feed for user ID: {}", userId);
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Follow> followers = followService.getFollowers(userId);
        List<Post> posts = postRepository.findByUser_UserId(userId);
        followers.forEach(follower -> {
            posts.addAll(postRepository.findByUser_UserId(follower.getUser().getUserId()));
        });
        Collections.shuffle(posts);
        log.info("Loaded feed for user ID: {}", userId);
        return posts;
    }
}
