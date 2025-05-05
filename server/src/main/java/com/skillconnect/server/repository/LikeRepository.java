package com.skillconnect.server.repository;

import com.skillconnect.server.model.Like;
import com.skillconnect.server.model.Post;
import com.skillconnect.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Integer> {
    List<Like> findByPost(Post post);
    List<Like> findByPost_PostId(int postid);
    List<Like> findByUser(User user);
    Optional<Like> findByUserAndPost(User user, Post post);
    int countByPost(Post post);
    boolean existsByUserAndPost(User user, Post post);
    Optional<Like> findByUser_UserIdAndPost_PostId(int userId, int postId);
    void deleteByPost_PostId(int postId);
}
