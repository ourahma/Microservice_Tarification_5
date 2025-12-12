package net.umi.tarification_itn.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.umi.tarification_itn.model.dto.*;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.*;
import net.umi.tarification_itn.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tarification/demandes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tarification des Demandes", description = "Gestion des tarifications pour les demandes")
public class DemandeTarificationController {

    private final TarificationService tarificationService;

    @GetMapping("/avec-itineraire")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRESTATAIRE', 'CLIENT')")
    @Operation(summary = "Récupère toutes les demandes avec leurs itinéraires")
    public ResponseEntity<List<DemandeWithItineraireDTO>> getDemandesAvecItineraire(
            @RequestHeader("Authorization") String token) {

        log.info("Récupération des demandes avec itinéraires");
        List<DemandeWithItineraireDTO> demandes = tarificationService.getDemandesAvecItineraire(token);
        for (DemandeWithItineraireDTO d : demandes){
            System.out.println(d.getDemandeId());
        }
        return ResponseEntity.ok(demandes);
    }

    @PostMapping("/calculer-tarif")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRESTATAIRE', 'CLIENT')")
    @Operation(summary = "Calcule et enregistre un tarif pour une demande avec itinéraire")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tarification calculé avec succès",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TarificationResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Données de requête invalides"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<TarificationResponseDTO> calculerTarif(
            @Valid @RequestBody TarificationRequestDTO request,
            @RequestHeader("Authorization") String token) {

        log.info("Calcul de tarif pour demande: {}", request.getDemandeId());
        TarificationResponseDTO tarification = tarificationService.calculerEtEnregistrerTarif(request, token);

        return ResponseEntity.status(HttpStatus.CREATED).body(tarification);
    }

    @GetMapping("/{demandeId}/tarifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRESTATAIRE', 'CLIENT')")
    @Operation(summary = "Récupère les tarifications d'une demande spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Récupérer le tarif d'une demande"),
            @ApiResponse(responseCode = "400", description = "Données de requête invalides"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<List<TarificationResponseDTO>> getTarificationsByDemande(
            @PathVariable Long demandeId) {

        log.info("Récupération des tarifications pour la demande: {}", demandeId);
        List<TarificationResponseDTO> tarifications = tarificationService.getTarificationsByDemandeId(demandeId);

        return ResponseEntity.ok(tarifications);
    }

    @GetMapping("/tarification/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRESTATAIRE', 'CLIENT')")
    @Operation(summary = "Récupère une tarification par son ID")
    public ResponseEntity<TarificationResponseDTO> getTarificationById(@PathVariable String id) {

        log.info("Récupération de la tarification: {}", id);
        TarificationResponseDTO tarification = tarificationService.getTarificationById(id);

        return ResponseEntity.ok(tarification);
    }
}
