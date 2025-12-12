package net.umi.tarification_itn.repository;

import net.umi.tarification_itn.model.entity.Tarification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TarificationRepository extends JpaRepository<Tarification,String> {


    Optional<Tarification> findByDemandeIdAndItineraireId(Long demandeId, String itineraireId);

    List<Tarification> findByDemandeId(Long demandeId);

    List<Tarification> findByClientId(Long clientId);

    List<Tarification> findByChauffeurId(String chauffeurId);

    List<Tarification> findByStatut(String statut);
}
