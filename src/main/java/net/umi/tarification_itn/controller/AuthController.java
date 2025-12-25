package net.umi.tarification_itn.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.*;
import net.umi.tarification_itn.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentification", description = "Gestion de l'authentification et des utilisateurs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authentification d'un utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentification réussie",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = LoginResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Identifiants incorrects"),
            @ApiResponse(responseCode = "403", description = "Compte désactivé ou non vérifié"),
            @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        try {
            log.info("Tentative de connexion pour: {}", loginRequest.getEmail());

            LoginResponseDTO loginResponse = authService.login(loginRequest);

            return ResponseEntity.ok(loginResponse);

        } catch (RuntimeException e) {
            log.error("Erreur d'authentification: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", e.getMessage());

            if (e.getMessage().contains("Identifiants incorrects")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            } else if (e.getMessage().contains("Compte désactivé")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rafraîchir le token JWT")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO refreshRequest) {
        try {
            log.info("Rafraîchissement du token");

            LoginResponseDTO loginResponse = authService.refreshToken(refreshRequest.getRefreshToken());

            return ResponseEntity.ok(loginResponse);

        } catch (RuntimeException e) {
            log.error("Erreur lors du rafraîchissement du token: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Token refresh failed");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/validate")
    @Operation(summary = "Valider un token JWT")
    public ResponseEntity<Map<String, Boolean>> validateToken(@RequestHeader("Authorization") String token) {
        log.info("Validation du token");

        boolean isValid = authService.validateToken(token);

        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", isValid);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Récupérer les informations de l'utilisateur courant")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            log.info("Récupération des informations de l'utilisateur courant");

            UserInfoDTO userInfo = authService.getCurrentUserInfo(token);

            return ResponseEntity.ok(userInfo);

        } catch (RuntimeException e) {
            log.error("Erreur lors de la récupération des informations: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication required");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/role")
    @Operation(summary = "Récupérer le rôle de l'utilisateur courant")
    public ResponseEntity<?> getUserRole(@RequestHeader("Authorization") String token) {
        try {
            log.info("Récupération du rôle de l'utilisateur");

            String role = authService.getUserRole(token);

            if (role != null) {
                Map<String, String> response = new HashMap<>();
                response.put("role", role);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Role not found");
                errorResponse.put("message", "Impossible de déterminer le rôle de l'utilisateur");

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du rôle: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication required");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/check-session")
    @Operation(summary = "Vérifier la session utilisateur")
    public ResponseEntity<Map<String, Object>> checkSession(@RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> response = new HashMap<>();

        if (token == null || token.isEmpty()) {
            response.put("authenticated", false);
            response.put("message", "Aucun token fourni");
            return ResponseEntity.ok(response);
        }

        try {
            UserInfoDTO userInfo = authService.getCurrentUserInfo(token);
            response.put("authenticated", true);
            response.put("user", userInfo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("authenticated", false);
            response.put("message", "Session invalide ou expirée");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Déconnexion (côté client)")
    public ResponseEntity<Map<String, String>> logout() {
        log.info("Déconnexion de l'utilisateur");
        Map<String, String> response = new HashMap<>();
        response.put("message", "Déconnexion réussie");

        return ResponseEntity.ok(response);
    }
}
