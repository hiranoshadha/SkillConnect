package com.skillconnect.server.service.serviceImpl;

import com.skillconnect.server.model.User;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.security.JwtTokenUtil;
import com.skillconnect.server.service.OAuthService;
import com.skillconnect.server.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.log4j.Log4j2;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Log4j2
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.jwtTokenUtil = jwtTokenUtil;
        log.info("UserServiceImpl initialized");
    }

    @Override
    public User saveUser(User user) {
        log.info("Saving new user with email: {}", user.getEmail());
        User savedUser = userRepository.save(user);
        log.info("User saved successfully with ID: {}", savedUser.getUserId());
        return savedUser;
    }

    @Override
    public Optional<User> findById(int userId) {
        log.debug("Finding user by ID: {}", userId);
        return userRepository.findById(userId);
    }

    @Override
    public User findByEmail(String email) {
        log.debug("Finding user by email: {}", email);
        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found with email: " + email);
            }
            log.debug("User found with email: {}", email);
            return user;
        } catch (RuntimeException e) {
            log.error("Failed to find user with email: {}", email, e);
            throw e;
        }
    }

    @Override
    public List<User> findAllUsers() {
        log.debug("Retrieving all users");
        List<User> users = userRepository.findAll();
        log.debug("Found {} users", users.size());
        return users;
    }

    @Override
    public void deleteUser(int userId) {
        log.info("Deleting user with ID: {}", userId);
        userRepository.deleteById(userId);
        log.info("User deleted successfully: {}", userId);
    }

    @Override
    public boolean existsByEmail(String email) {
        log.debug("Checking if user exists with email: {}", email);
        boolean exists = userRepository.existsByEmail(email);
        log.debug("User exists with email {}: {}", email, exists);
        return exists;
    }

    @Override
    public boolean existsByUsername(String username) {
        log.debug("Checking if user exists with username: {}", username);
        boolean exists = userRepository.existsByUsername(username);
        log.debug("User exists with username {}: {}", username, exists);
        return exists;
    }

    @Override
    public User updateUser(int userid, User user) {
        log.info("Updating profile for user ID: {}", userid);
        User userExist = userRepository.findById(userid)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userid);
                    return new RuntimeException("User not found with id: " + userid);
                });

        if (user.getFirstName() != null) {
            log.debug("Updating first name for user ID: {}", userid);
            userExist.setFirstName(user.getFirstName());
        }

        if (user.getLastName() != null) {
            log.debug("Updating last name for user ID: {}", userid);
            userExist.setLastName(user.getLastName());
        }

        if (user.getBio() != null) {
            log.debug("Updating bio for user ID: {}", userid);
            userExist.setBio(user.getBio());
        }

        if (user.getProfileImage() != null) {
            log.debug("Updating profile image for user ID: {}", userid);
            userExist.setProfileImage(user.getProfileImage());
        }

        User updatedUser = userRepository.save(userExist);
        log.info("Profile updated successfully for user ID: {}", userid);
        return updatedUser;
    }

    @Override
    public boolean changePassword(int userId, String currentPassword, String newPassword) {
        log.info("Attempting to change password for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
        user.setPassword(newPassword);
        userRepository.save(user);

        log.info("Password changed successfully for user ID: {}", userId);
        return true;
    }

    @Override
    public Map<String, Object> login(User userDetails) {
        log.info("Attempting to login with username: {}", userDetails.getEmail());
        User user = userRepository.findByEmail(userDetails.getEmail());
        if (user != null && user.getPassword().equals(userDetails.getPassword())) {

            String token = jwtTokenUtil.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);

            log.info("Login successful for user: {}", userDetails.getEmail());
            return response;
        } else {
            log.warn("Login failed for user: {}", userDetails.getEmail());
            return null;
        }
    }

    @Override
    public Map<String, String> loginOAuth(String code) {
        OAuthService oAuthService = new OAuthServiceImpl(userRepository);
        User user = oAuthService.processGrantCode(code);

        String token = jwtTokenUtil.generateToken(user.getEmail());
        Map<String, String> userDetails = new HashMap<>();
        userDetails.put("token", token);
        userDetails.put("email", user.getEmail());

        log.info("Login successful for user: {}", user.getEmail());
        return userDetails;
    }

    @Override
    public List<User> searchUsers(String query) {
        log.debug("Searching users with query: {}", query);
        List<User> users = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query,
                query);
        log.debug("Found {} users matching query: {}", users.size(), query);
        return users;
    }

}