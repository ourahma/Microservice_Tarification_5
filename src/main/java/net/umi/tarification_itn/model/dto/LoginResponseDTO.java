package net.umi.tarification_itn.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String phoneNumber;
    private Long expiresIn; // en secondes
}
