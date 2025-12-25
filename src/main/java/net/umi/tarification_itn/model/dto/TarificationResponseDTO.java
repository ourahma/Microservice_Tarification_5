package net.umi.tarification_itn.model.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import net.umi.tarification_itn.model.enums.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor @ToString
public class TarificationResponseDTO {

    private String id;
    private Long demandeId;
    private String itineraireId;
    private Long clientId;
    private String chauffeurId;
    private BigDecimal volume;
    private BigDecimal poids;
    private Double distanceKm;
    private String natureMarchandise;
    private Boolean fragile;
    private String temperatureRequise;
    private BigDecimal tarifClient;
    private BigDecimal tarifPrestataire;
    private BigDecimal margeService;
    private StatusTatification statut;
    private TypeRoute typeRoute;
    private Boolean inclureRetour;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]")
    private LocalDateTime dateCreation;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]")
    private LocalDateTime dateExpiration;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]")
    private LocalDateTime dateValidation;
}
