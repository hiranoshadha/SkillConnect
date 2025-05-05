package com.skillconnect.server.service;


import com.skillconnect.server.model.User;

public interface OAuthService {

    User processGrantCode(String code);

    User getProfileDetailsGoogle(String accessToken);

    String getOauthAccessTokenGoogle(String code);
}