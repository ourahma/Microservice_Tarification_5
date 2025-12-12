package net.umi.tarification_itn.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrixDTO {

    private BigDecimal tarifClient;
    private BigDecimal tarifPrestataire;
    private BigDecimal margeService;
    private String devise;
    private String detailCalcul;
}
