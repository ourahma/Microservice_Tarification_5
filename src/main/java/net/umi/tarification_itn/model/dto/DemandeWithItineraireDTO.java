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
public class DemandeWithItineraireDTO {
    private Long demandeId;
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
    private String itineraireAssocieId;
    private Double distanceDemande;
    private ItineraireDTO itineraire;
    private DemandeDTO.CategorieDTO categorie;
    private Boolean itineraireExists;
    private Boolean tarifExists;
    private TarificationResponseDTO tarification;
}
