package net.umi.tarification_itn.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {
    @NotBlank(message = "L'email est requis")
    @JsonProperty("email")
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    @JsonProperty("password")
    private String password;
}
