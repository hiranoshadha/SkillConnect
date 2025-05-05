package com.skillconnect.server.service.serviceImpl;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.skillconnect.server.model.User;
import com.skillconnect.server.repository.UserRepository;
import com.skillconnect.server.service.OAuthService;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.UUID;

@Log4j2
public class OAuthServiceImpl implements OAuthService {

    private final UserRepository userRepository;

    public OAuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    String clientId = "920716417496-4epc3rpf8vogsvupksrrbm72mlgqkolm.apps.googleusercontent.com";
    String clientSecret = "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";

    public User processGrantCode(String code) {
        String accessToken = getOauthAccessTokenGoogle(code);

        User googleUser = getProfileDetailsGoogle(accessToken);
        User user = userRepository.findByEmail(googleUser.getEmail());

        if (user == null) {
            User newUser = new User();
            newUser.setEmail(googleUser.getEmail());
            newUser.setFirstName(googleUser.getFirstName());
            newUser.setLastName(googleUser.getLastName());
            newUser.setUsername(googleUser.getUsername());
            newUser.setPassword(googleUser.getPassword());
            newUser.setRole("USER");
            newUser.setBio("");
            userRepository.save(newUser);
            user = newUser;
        }
        return user;

    }

    public User getProfileDetailsGoogle(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(accessToken);

        HttpEntity<String> requestEntity = new HttpEntity<>(httpHeaders);

        String url = "https://www.googleapis.com/oauth2/v2/userinfo";
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
        JsonObject jsonObject = new Gson().fromJson(response.getBody(), JsonObject.class);

        String name = jsonObject.get("name").toString().replace("\"", "");
        String fname;
        String lname = null;

        String[] nameParts = name.trim().split("\\s+");

        if (nameParts.length > 1) {
            fname = nameParts[0];
            lname = String.join(" ", Arrays.copyOfRange(nameParts, 1, nameParts.length));
        } else {
            fname = name;
        }

        User user = new User();
        user.setEmail(jsonObject.get("email").toString().replace("\"", ""));
        user.setFirstName(fname);
        user.setLastName(lname);
        user.setUsername(jsonObject.get("email").toString().replace("\"", ""));
        user.setPassword(UUID.randomUUID().toString());

        return user;
    }

    public String getOauthAccessTokenGoogle(String code) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("redirect_uri", "http://localhost:8080/api/users/oauth2");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("scope", "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile");
        params.add("scope", "https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email");
        params.add("scope", "openid");
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, httpHeaders);

        String url = "https://oauth2.googleapis.com/token";
        String response = restTemplate.postForObject(url, requestEntity, String.class);
        JsonObject jsonObject = new Gson().fromJson(response, JsonObject.class);

        return jsonObject.get("access_token").toString().replace("\"", "");
    }
}