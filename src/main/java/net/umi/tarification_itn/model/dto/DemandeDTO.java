package net.umi.tarification_itn.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandeDTO {
    private Long id;
    private Long clientId;
    private Double volume;
    private Double poids;
    private String natureMarchandise;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]")
    private LocalDateTime dateDepart;

    private String villeDepart;
    private String villeDestination;
    private String statutValidation;
    private BigDecimal devisEstime;
    private String itineraireAssocieId;
    private Double distanceKm;
    private Integer dureeEstimeeMin;
    private Long missionId;

    private CategorieDTO categorie;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]")
    private LocalDateTime dateCreation;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]")
    private LocalDateTime dateModification;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorieDTO {
        private String idCategorie;
        private String nom;
        private Boolean fragile;
        private String temperatureRequise;
    }
}
