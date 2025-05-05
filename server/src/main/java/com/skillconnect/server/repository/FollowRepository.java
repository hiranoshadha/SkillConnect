package com.skillconnect.server.repository;

import com.skillconnect.server.model.Follow;
import com.skillconnect.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Integer> {
    List<Follow> findByFollower_userId(int id);
    List<Follow> findByUser_UserId(int id);
    
    int countByFollower(User follower);
    int countByUser(User following);
    
    Optional<Follow> findByFollower_UserIdAndUser_UserId(int follower, int following);
}
