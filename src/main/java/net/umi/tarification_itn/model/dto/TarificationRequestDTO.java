package net.umi.tarification_itn.model.dto;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarificationRequestDTO {
    @NotNull(message = "L'ID de la demande est obligatoire")
    private Long demandeId;

    @NotNull(message = "L'ID de l'itinéraire est obligatoire")
    private String itineraireId;

    private String typeRoute = "ROUTE_NATIONALE";
    private Boolean inclureRetour = true;
}
