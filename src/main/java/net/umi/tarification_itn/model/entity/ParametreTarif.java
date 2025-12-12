package net.umi.tarification_itn.model.entity;


import jakarta.persistence.Table;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "parametres_tarif")
@Data
@NoArgsConstructor @AllArgsConstructor
public class ParametreTarif {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String libelle;

    @Column(nullable = false)
    private Double valeur;

    @Column(nullable = false)
    private String type; // "FIXE", "PAR_KM", "PAR_KG", "MULTIPLICATEUR"

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    private LocalDateTime dateModification;
}
