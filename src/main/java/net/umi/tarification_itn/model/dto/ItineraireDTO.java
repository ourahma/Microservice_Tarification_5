package net.umi.tarification_itn.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraireDTO {

    @JsonProperty("id")
    private String routeId;

    @JsonProperty("userId")
    private String userId;


    public String getChauffeurId() {
        return userId;
    }

    private Double originLatitude;
    private Double originLongitude;
    private String originAddress;
    private String originCity;

    private Double destinationLatitude;
    private Double destinationLongitude;
    private String destinationAddress;
    private String destinationCity;

    private Double distanceKm;
    private Integer durationMin;

    @JsonProperty("returnDistanceKm")
    private Double returnDistanceKm;

    @JsonProperty("returnDurationMin")
    private Integer returnDurationMin;

    @JsonProperty("totalDistanceKm")
    private Double totalDistanceKm;

    @JsonProperty("totalDurationMin")
    private Integer totalDurationMin;

    @JsonProperty("includeReturn")
    private Boolean includeReturn;

    @JsonProperty("isOptimized")
    private Boolean isOptimized;

    private String optimizationType;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]")
    private LocalDateTime createdAt;

    private String status;
    private String calculatedBy;
}