package com.skillconnect.server.repository;

import com.skillconnect.server.model.Post;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Integer> {
    Optional<Post> findByPostId(int postid);
    List<Post> findByUser_UserId(int userid);
}
