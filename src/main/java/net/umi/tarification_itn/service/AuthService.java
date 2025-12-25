package net.umi.tarification_itn.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    @Value("${spring.microservices.auth.base-url}")
    private String authBaseUrl;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final RestTemplate restTemplate;
    ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;

    /**
     * Authentification avec le microservice d'authentification
     */
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        log.info("Tentative de connexion pour l'utilisateur: {}", loginRequest.getEmail());

        try {
            String url = authBaseUrl + "/account/login/"; // ou enlever le slash final si nécessaire
            log.info("Tentative de connexion pour la login: {}", url);

            // Préparer les headers pour form-encoded
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Préparer les données du formulaire
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("email", loginRequest.getEmail());
            formData.add("password", loginRequest.getPassword());

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(formData, headers);

            // Appel au microservice
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            log.info("Response: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Parser le JSON

                JsonNode jsonNode = objectMapper.readTree(response.getBody());

                // Construire la réponse
                LoginResponseDTO loginResponse = new LoginResponseDTO();
                loginResponse.setToken(jsonNode.get("access").asText());
                loginResponse.setRefreshToken(jsonNode.get("refresh").asText());
                loginResponse.setType("Bearer");

                // Extraction des infos utilisateur depuis le token
                UserInfoDTO userInfo = getCurrentUserInfo(jsonNode.get("access").asText());
                if (userInfo != null) {
                    loginResponse.setId(userInfo.getId());
                    loginResponse.setUsername(userInfo.getUsername());
                    loginResponse.setEmail(userInfo.getEmail());
                    loginResponse.setRole(userInfo.getRole());
                    loginResponse.setFullName(userInfo.getFullName());
                    loginResponse.setPhoneNumber(userInfo.getPhoneNumber());
                }

                loginResponse.setExpiresIn(3600L); // 1 heure par défaut
                log.info("Connexion réussie pour l'utilisateur: {}", loginRequest.getEmail());
                return loginResponse;

            } else {
                throw new RuntimeException("Échec de l'authentification: " + response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            log.error("Erreur d'authentification pour {}: {}", loginRequest.getEmail(), e.getMessage());

            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new RuntimeException("Identifiants incorrects");
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new RuntimeException("Compte désactivé ou non vérifié");
            } else {
                throw new RuntimeException("Erreur d'authentification: " + e.getMessage());
            }

        } catch (Exception e) {
            log.error("Erreur lors de l'authentification: ", e);
            throw new RuntimeException("Erreur serveur lors de l'authentification");
        }
    }


    /**
     * Rafraîchir le token
     */
    public LoginResponseDTO refreshToken(String refreshToken) {
        log.info("Rafraîchissement du token");

        try {
            String url = authBaseUrl + "/account/refresh/";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("refresh", refreshToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();

                LoginResponseDTO loginResponse = new LoginResponseDTO();
                loginResponse.setToken((String) responseBody.get("access"));
                loginResponse.setRefreshToken(refreshToken);
                loginResponse.setType("Bearer");
                loginResponse.setExpiresIn(3600L);

                log.info("Token rafraîchi avec succès");
                return loginResponse;

            } else {
                throw new RuntimeException("Échec du rafraîchissement du token");
            }

        } catch (Exception e) {
            log.error("Erreur lors du rafraîchissement du token: ", e);
            throw new RuntimeException("Impossible de rafraîchir le token");
        }
    }

    /**
     * Vérifier un token
     */
    public boolean validateToken(String token) {
        log.info("Validation du token");

        try {
            // Pour valider, on peut simplement appeler un endpoint protégé
            String url = authBaseUrl + "/account/users/me/";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token.replace("Bearer ", ""));

            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    Map.class
            );

            return response.getStatusCode() == HttpStatus.OK;

        } catch (Exception e) {
            log.warn("Token invalide: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Récupérer les informations de l'utilisateur courant
     */
    public UserInfoDTO getCurrentUserInfo(String token) {
        log.info("Récupération des informations de l'utilisateur courant");
        UserInfoDTO userInfo = new UserInfoDTO();

        try {
            String url = authBaseUrl + "/account/users/";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token.replace("Bearer ", ""));

            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            // On récupère une liste de Map
            ResponseEntity<List> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    List.class
            );

            List<Map<String, Object>> users = response.getBody();

            if (response.getStatusCode() == HttpStatus.OK && users != null && !users.isEmpty()) {
                Map<String, Object> userData = users.get(0); // on prend le premier utilisateur

                userInfo.setId(((Number) userData.get("id")).longValue());
                userInfo.setUsername((String) userData.get("nom"));          // champ "nom" dans votre JSON
                userInfo.setFullName((String) userData.get("prenom"));       // champ "prenom"
                userInfo.setEmail((String) userData.get("email"));
                userInfo.setPhoneNumber((String) userData.get("telephone")); // champ "telephone"
                userInfo.setRole((String) userData.get("role"));
                userInfo.setIsActive((Boolean) userData.get("is_active"));
                userInfo.setCreatedAt((String) userData.get("created_at"));


                return userInfo;
            } else {
                throw new RuntimeException("Impossible de récupérer les informations utilisateur");
            }

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des informations utilisateur: ", e);
            return userInfo;
        }
    }


    /**
     * Récupérer le rôle de l'utilisateur
     */
    public String getUserRole(String token) {
        log.info("Récupération du rôle de l'utilisateur");

        try {
            UserInfoDTO userInfo = getCurrentUserInfo(token);
            return userInfo.getRole();

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du rôle: ", e);
            return null;
        }
    }

}
