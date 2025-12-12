package net.umi.tarification_itn.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.TarificationRequestDTO;
import net.umi.tarification_itn.model.dto.TarificationResponseDTO;
import net.umi.tarification_itn.model.dto.ErrorResponse;
import net.umi.tarification_itn.service.TarificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tarification")
@RequiredArgsConstructor
@Slf4j
public class TarificationController {

    private final TarificationService tarificationService;

    @Operation(summary = "Calculer une tarification à partie de demandeID et itineraireId")
    @PostMapping("/calculer")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN', 'PRESTATAIRE')")
    public ResponseEntity<TarificationResponseDTO> calculerTarif(
            @Valid @RequestBody TarificationRequestDTO request,
            @RequestHeader("Authorization") String token) {

        log.info("Requête de calcul de tarif pour demande: {}", request.getDemandeId());

        TarificationResponseDTO response = tarificationService.calculerEtEnregistrerTarif(request, token);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une tarification par son ID")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN', 'PRESTATAIRE')")
    public ResponseEntity<TarificationResponseDTO> getTarification(@PathVariable String id) {
        log.info("Récupération de la tarification: {}", id);

        TarificationResponseDTO response = tarificationService.getTarificationById(id);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/valider")
    @Operation(summary = "Valider une tafification par sont ID")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<TarificationResponseDTO> validerTarification(@PathVariable String id) {
        log.info("Validation de la tarification: {}", id);

        TarificationResponseDTO response = tarificationService.validerTarification(id);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/paiement")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRESTATAIRE', 'CLIENT')")
    @Operation(summary = "Effectue le paiement d'une tarification validée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Paiement effectué avec succès",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = TarificationResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "La tarification n'est pas validée ou a expiré"),
            @ApiResponse(responseCode = "404", description = "Tarification non trouvée"),
            @ApiResponse(responseCode = "409", description = "La tarification est déjà payée")
    })
    public ResponseEntity<?> payerTarification(@PathVariable String id) {
        try {
            log.info("Tentative de paiement pour la tarification: {}", id);
            TarificationResponseDTO tarificationPayee = tarificationService.payerTarification(id);
            return ResponseEntity.ok(tarificationPayee);

        } catch (IllegalStateException e) {
            // Gestion spécifique des erreurs de business rules
            log.warn("Erreur de paiement pour la tarification {}: {}", id, e.getMessage());

            if (e.getMessage().contains("doit être validée")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(
                                "PAIEMENT_NON_AUTORISE",
                                e.getMessage(),
                                "Veuillez d'abord valider la tarification avant de procéder au paiement."
                        ));
            } else if (e.getMessage().contains("déjà payée")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse(
                                "DEJA_PAYEE",
                                e.getMessage(),
                                "Cette tarification a déjà été payée."
                        ));
            } else if (e.getMessage().contains("a expiré")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(
                                "TARIFICATION_EXPIREE",
                                e.getMessage(),
                                "La tarification a expiré, veuillez en créer une nouvelle."
                        ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse(
                                "ERREUR_PAIEMENT",
                                e.getMessage(),
                                "Impossible de procéder au paiement."
                        ));
            }

        } catch (RuntimeException e) {
            log.error("Erreur lors du paiement de la tarification {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(
                            "TARIFICATION_NON_TROUVEE",
                            e.getMessage(),
                            "La tarification demandée n'existe pas."
                    ));
        }
    }
}
