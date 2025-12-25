package net.umi.tarification_itn.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String phoneNumber;
    private Boolean isActive;
    private Boolean isVerified;
    private String createdAt;
    private String lastLogin;
}
