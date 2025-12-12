package net.umi.tarification_itn.model.entity;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.ToString;
import net.umi.tarification_itn.model.enums.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tarifications")
@Data
@NoArgsConstructor
@AllArgsConstructor @ToString
public class Tarification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false,name = "demande_id")
    private Long demandeId;

    @Column(nullable = false)
    private String itineraireId;

    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private String chauffeurId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal volume;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal poids;

    @Column(nullable = false)
    private Double distanceKm;

    @Column(nullable = false)
    private String natureMarchandise;

    @Column(nullable = false)
    private Boolean fragile;

    @Column
    private String temperatureRequise;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifClient;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifPrestataire;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal margeService;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTatification statut = StatusTatification.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeRoute typeRoute = TypeRoute.ROUTE_NATIONALE;

    @Column(nullable = false)
    private Boolean inclureRetour = true;

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime dateExpiration;

    @Column(nullable = true)
    private LocalDateTime datePaiement;

    @Column
    private LocalDateTime dateValidation;

    @PrePersist
    private void setDefaultValues() {
        if (dateExpiration == null) {
            dateExpiration = dateCreation.plusDays(7);
        }
    }
}
