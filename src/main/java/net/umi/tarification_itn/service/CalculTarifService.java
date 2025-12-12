package net.umi.tarification_itn.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.DemandeDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import net.umi.tarification_itn.model.dto.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalculTarifService {

    @Value("${tarification.prix.base:500.0}")
    private Double prixBase;

    @Value("${tarification.prix.par-km:10.0}")
    private Double prixParKm;

    @Value("${tarification.prix.par-kg:5.0}")
    private Double prixParKg;

    @Value("${tarification.prix.par-m3:15.0}")
    private Double prixParM3;

    @Value("${tarification.prix.fragile-multiplier:1.3}")
    private Double fragileMultiplier;

    @Value("${tarification.prix.route-nationale-multiplier:1.0}")
    private Double routeNationaleMultiplier;

    @Value("${tarification.prix.marge-prestataire:0.25}")
    private Double margePrestataire;

    public PrixDTO calculerTarif(DemandeDTO demande, ItineraireDTO itineraire, String typeRoute, Boolean inclureRetour) {
        log.info("Calcul tarif pour demande {} - Itinéraire {}", demande.getId(), itineraire.getRouteId());

        // Utiliser la distance de l'itinéraire
        double distance = inclureRetour ? itineraire.getTotalDistanceKm() : itineraire.getDistanceKm();

        // Calcul des composantes
        BigDecimal tarifBase = BigDecimal.valueOf(prixBase);
        BigDecimal tarifDistance = BigDecimal.valueOf(distance).multiply(BigDecimal.valueOf(prixParKm));
        BigDecimal tarifPoids = BigDecimal.valueOf(demande.getPoids()).multiply(BigDecimal.valueOf(prixParKg));
        BigDecimal tarifVolume = BigDecimal.valueOf(demande.getVolume()).multiply(BigDecimal.valueOf(prixParM3));

        // Tarif brut
        BigDecimal tarifBrut = tarifBase.add(tarifDistance).add(tarifPoids).add(tarifVolume);

        // Appliquer les multiplicateurs
        BigDecimal multiplicateur = BigDecimal.ONE;

        // Multiplicateur pour marchandise fragile
        if (demande.getCategorie() != null && Boolean.TRUE.equals(demande.getCategorie().getFragile())) {
            multiplicateur = multiplicateur.multiply(BigDecimal.valueOf(fragileMultiplier));
        }

        // Multiplicateur pour route nationale
        if ("ROUTE_NATIONALE".equals(typeRoute)) {
            multiplicateur = multiplicateur.multiply(BigDecimal.valueOf(routeNationaleMultiplier));
        }

        // Tarif final client
        BigDecimal tarifClient = tarifBrut.multiply(multiplicateur)
                .setScale(2, RoundingMode.HALF_UP);

        // Tarif prestataire (avec marge de 25%)
        BigDecimal tarifPrestataire = tarifClient.multiply(BigDecimal.ONE.subtract(BigDecimal.valueOf(margePrestataire)))
                .setScale(2, RoundingMode.HALF_UP);

        // Marge du service
        BigDecimal margeService = tarifClient.subtract(tarifPrestataire);

        // Détail du calcul
        String detailCalcul = String.format(
                "Base: %.2f + Distance (%.2f km): %.2f + Poids (%.2f kg): %.2f + Volume (%.2f m³): %.2f = %.2f × %.2f = %.2f MAD",
                tarifBase, distance, tarifDistance, demande.getPoids(), tarifPoids,
                demande.getVolume(), tarifVolume, tarifBrut, multiplicateur, tarifClient
        );

        log.info("Tarif calculé - Client: {} MAD, Prestataire: {} MAD", tarifClient, tarifPrestataire);

        return new PrixDTO(tarifClient, tarifPrestataire, margeService, "MAD", detailCalcul);
    }
}