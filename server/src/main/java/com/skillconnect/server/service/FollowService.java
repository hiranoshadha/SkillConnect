package com.skillconnect.server.service;

import com.skillconnect.server.model.Follow;

import java.util.List;

public interface FollowService {
    
    Follow followUser(Follow follow);
    
    void unfollowUser(Follow follow);
    
    int getFollowerCount(int userId);
    
    int getFollowingCount(int userId);
    
    boolean isFollowing(int followerId, int followingId);

    List<Follow> getFollowers(int userId);
}
