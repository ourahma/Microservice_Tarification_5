package net.umi.tarification_itn.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import net.umi.tarification_itn.model.entity.Tarification;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_tarifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueTarification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tarification_id", nullable = false)
    private Tarification tarification;

    @Column(nullable = false)
    private Double ancienPrix;

    @Column(nullable = false)
    private Double nouveauPrix;

    @Column(nullable = false)
    private String raisonModification;

    @Column(nullable = false)
    private String modifiePar;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateModification;

    @Column(columnDefinition = "TEXT")
    private String detailsModification;
}
