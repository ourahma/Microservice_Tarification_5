package net.umi.tarification_itn.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyCodeRequestDTO {
    @NotBlank(message = "L'email est requis")
    private String email;

    @NotBlank(message = "Le code est requis")
    private String code;
}
