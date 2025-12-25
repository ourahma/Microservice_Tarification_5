package net.umi.tarification_itn.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.*;
import net.umi.tarification_itn.model.entity.Tarification;
import net.umi.tarification_itn.model.enums.StatusTatification;
import net.umi.tarification_itn.repository.TarificationRepository;
import org.hibernate.service.spi.ServiceException;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TarificationService {

    private final TarificationRepository tarificationRepository;
    private final DemandeClientService demandeClientService;
    private final ItineraireClientService itineraireClientService;
    private final CalculTarifService calculTarifService;

    @Transactional
    public TarificationResponseDTO calculerEtEnregistrerTarif(TarificationRequestDTO request, String token) {
        log.info("Calcul tarif pour demande {} et itinéraire {}", request.getDemandeId(), request.getItineraireId());

        // Récupérer la demande
        DemandeDTO demande = demandeClientService.getDemandeById(request.getDemandeId(), token);

        // Récupérer l'itinéraire
        ItineraireDTO itineraire = itineraireClientService.getItineraireById(request.getItineraireId(), token);

        // Calculer le tarif
        PrixDTO prix = calculTarifService.calculerTarif(
                demande,
                itineraire,
                request.getTypeRoute(),
                request.getInclureRetour()
        );

        // Créer et sauvegarder la tarification
        Tarification tarification = new Tarification();
        tarification.setDemandeId(demande.getId());
        tarification.setItineraireId(itineraire.getRouteId());
        tarification.setClientId(demande.getClientId());
        tarification.setChauffeurId(itineraire.getChauffeurId());
        tarification.setVolume(BigDecimal.valueOf(demande.getVolume()));
        tarification.setPoids(BigDecimal.valueOf(demande.getPoids()));
        tarification.setDistanceKm(request.getInclureRetour() ? itineraire.getTotalDistanceKm() : itineraire.getDistanceKm());
        tarification.setNatureMarchandise(demande.getNatureMarchandise());
        tarification.setFragile(demande.getCategorie() != null && demande.getCategorie().getFragile());
        tarification.setTemperatureRequise(demande.getCategorie() != null ?
                demande.getCategorie().getTemperatureRequise() : "ambiante");
        tarification.setTarifClient(prix.getTarifClient());
        tarification.setTarifPrestataire(prix.getTarifPrestataire());
        tarification.setMargeService(prix.getMargeService());
        tarification.setInclureRetour(request.getInclureRetour());
        tarification.setDateCreation(LocalDateTime.now());
        tarification.setDateExpiration(LocalDateTime.now().plusDays(7));

        Tarification saved = tarificationRepository.save(tarification);
        log.info("Tarification enregistrée: {}", saved.getId());

        return mapToResponseDTO(saved);
    }

    public List<DemandeWithItineraireDTO> getDemandesAvecItineraire(String token) {
        log.info("Récupération des demandes avec itinéraires");

        List<DemandeDTO> demandes = demandeClientService.getAllDemandes(token);
        for(DemandeDTO d : demandes) {
            System.out.println("=======");
            System.out.println(d.getCategorie());
        }
        return demandes.stream().map(demande -> {
            DemandeWithItineraireDTO dto = new DemandeWithItineraireDTO();
            dto.setDemandeId(demande.getId());
            dto.setClientId(demande.getClientId());
            dto.setVolume(demande.getVolume());
            dto.setPoids(demande.getPoids());
            dto.setNatureMarchandise(demande.getNatureMarchandise());
            dto.setDateDepart(demande.getDateDepart());
            dto.setVilleDepart(demande.getVilleDepart());
            dto.setVilleDestination(demande.getVilleDestination());
            dto.setStatutValidation(demande.getStatutValidation());
            dto.setItineraireAssocieId(demande.getItineraireAssocieId());
            dto.setDistanceDemande(demande.getDistanceKm());
            dto.setCategorie(demande.getCategorie());


            if (demande.getItineraireAssocieId() != null) {
                try {
                    ItineraireDTO itineraire = itineraireClientService.getItineraireById(demande.getItineraireAssocieId(), token);
                    dto.setItineraire(itineraire);
                    dto.setItineraireExists(true);

                    // Vérifier si une tarification existe
                    tarificationRepository.findByDemandeIdAndItineraireId(demande.getId(), demande.getItineraireAssocieId())
                            .ifPresent(tarif -> {
                                dto.setTarifExists(true);
                                dto.setTarification(mapToResponseDTO(tarif));
                            });
                } catch (Exception e) {
                    log.warn("Itinéraire non trouvé pour la demande {}: {}", demande.getId(), e.getMessage());
                    dto.setItineraireExists(false);
                }
            } else {
                dto.setItineraireExists(false);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public TarificationResponseDTO getTarificationById(String id) {
        Tarification tarification = tarificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarification non trouvée: " + id));

        TarificationResponseDTO response = mapToResponseDTO(tarification);
        log.info("Tarification trouvé "+response);
        return response;
    }
    public List<TarificationResponseDTO> getAllTarification() {
        try {
            List<Tarification> tarifications = tarificationRepository.findAll();

            if (tarifications == null || tarifications.isEmpty()) {
                log.info("Aucune tarification trouvée");
                return Collections.emptyList();
            }

            List<TarificationResponseDTO> responseDTOs = mapToResponseListDTO(tarifications);

            log.debug("Récupération de {} tarifications", responseDTOs.size());
            return responseDTOs;

        } catch (DataAccessException e) {
            log.error("Erreur d'accès aux données lors de la récupération des tarifications", e);
            throw new ServiceException("Erreur technique lors de la récupération des données", e);
        } catch (Exception e) {
            log.error("Erreur inattendue lors de la récupération des tarifications", e);
            throw new ServiceException("Erreur inattendue", e);
        }
    }

    public List<TarificationResponseDTO> getTarificationsByDemandeId(Long demandeId) {
        List<Tarification> tarifications = tarificationRepository.findByDemandeId(demandeId);
        //List<Tarification> tarifications = tarificationRepository.findAll();
        for (Tarification tarification : tarifications) {
            System.out.println(tarification);
        }
        return tarifications.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }



    private TarificationResponseDTO mapToResponseDTO(Tarification tarification) {
        return new TarificationResponseDTO(
                tarification.getId(),
                tarification.getDemandeId(),
                tarification.getItineraireId(),
                tarification.getClientId(),
                tarification.getChauffeurId(),
                tarification.getVolume(),
                tarification.getPoids(),
                tarification.getDistanceKm(),
                tarification.getNatureMarchandise(),
                tarification.getFragile(),
                tarification.getTemperatureRequise(),
                tarification.getTarifClient(),
                tarification.getTarifPrestataire(),
                tarification.getMargeService(),
                tarification.getStatut(),
                tarification.getTypeRoute(),
                tarification.getInclureRetour(),
                tarification.getDateCreation(),
                tarification.getDateExpiration(),
                tarification.getDateValidation()
        );
    }

    private List<TarificationResponseDTO> mapToResponseListDTO(List<Tarification> tarifications) {
        if (tarifications == null || tarifications.isEmpty()) {
            return Collections.emptyList();
        }

        return tarifications.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TarificationResponseDTO validerTarification(String id) {
        Tarification tarification = tarificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarification non trouvée avec ID: " + id));

        // Validation des règles métier
        validerReglesMetier(tarification);

        // Mise à jour du statut
        tarification.setStatut(StatusTatification.VALIDE);
        tarification.setDateValidation(LocalDateTime.now());

        Tarification updated = tarificationRepository.save(tarification);
        log.info("Tarification {} validée par le client", id);

        return mapToResponseDTO(updated);
    }
    @Transactional
    public TarificationResponseDTO payerTarification(String id) {
        Tarification tarification = tarificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarification non trouvée avec ID: " + id));

        // Vérifier d'abord si la tarification est validée
        if (!StatusTatification.VALIDE.equals(tarification.getStatut())) {
            throw new IllegalStateException(
                    String.format("La tarification %s doit être validée avant d'être payée. Statut actuel: %s",
                            id, tarification.getStatut())
            );
        }
        if (StatusTatification.PAYE.equals(tarification.getStatut())) {
            throw new IllegalStateException(
                    String.format("La tarification %s est déjà payée.", id)
            );
        }

        // Vérifier l'expiration
        if (LocalDateTime.now().isAfter(tarification.getDateExpiration())) {
            throw new IllegalStateException(
                    String.format("La tarification %s a expiré le %s",
                            id, tarification.getDateExpiration())
            );
        }

        // Mise à jour du statut
        tarification.setStatut(StatusTatification.PAYE);
        tarification.setDatePaiement(LocalDateTime.now());

        Tarification updated = tarificationRepository.save(tarification);
        log.info("Tarification {} est payée", id);

        return mapToResponseDTO(updated);
    }


    @Transactional
    public TarificationResponseDTO marquerCommePayee(String id) {
        Tarification tarification = tarificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarification non trouvée avec ID: " + id));

        // Vérifier que la tarification est validée
        if (!StatusTatification.VALIDE.equals(tarification.getStatut())) {
            throw new RuntimeException("Seules les tarifications validées peuvent être marquées comme payées");
        }

        // Mise à jour du statut
        tarification.setStatut(StatusTatification.PAYE);
        tarification.setDatePaiement(LocalDateTime.now());

        Tarification updated = tarificationRepository.save(tarification);
        log.info("Tarification {} marquée comme payée", id);

        return mapToResponseDTO(updated);
    }

    /**
     * Tâche planifiée pour marquer les tarifications expirées
     * Exécutée toutes les heures
     */
    @Scheduled(cron = "0 0 * * * *") // Toutes les heures
    @Transactional
    public void marquerTarificationsExpirees() {
        log.info("Début de la vérification des tarifications expirées");

        List<Tarification> tarifications = tarificationRepository.findAll();
        int count = 0;

        for (Tarification tarification : tarifications) {
            if (doitEtreMarqueeExpiree(tarification)) {
                tarification.setStatut(StatusTatification.EXPIRE);
                tarificationRepository.save(tarification);
                count++;
            }
        }

        log.info("{} tarifications marquées comme expirées", count);
    }

    private boolean doitEtreMarqueeExpiree(Tarification tarification) {
        return LocalDateTime.now().isAfter(tarification.getDateExpiration())
                && !StatusTatification.VALIDE.equals(tarification.getStatut())
                && !StatusTatification.PAYE.equals(tarification.getStatut())
                && !StatusTatification.REJETE.equals(tarification.getStatut())
                && !StatusTatification.ANNULEE.equals(tarification.getStatut())
                && !StatusTatification.EXPIRE.equals(tarification.getStatut());
    }


    /**
     * Validation des règles métier communes
     */
    private void validerReglesMetier(Tarification tarification) {
        // Vérifier l'expiration
        if (LocalDateTime.now().isAfter(tarification.getDateExpiration())) {
            throw new RuntimeException("La tarification a expiré le " + tarification.getDateExpiration());
        }

        // Vérifier les transitions de statut autorisées
        switch (tarification.getStatut()) {
            case VALIDE:
                throw new RuntimeException("Cette tarification est déjà validée");
            case REJETE:
                throw new RuntimeException("Cette tarification est déjà rejetée");
            case PAYE:
                throw new RuntimeException("Cette tarification est déjà payée");
            case ANNULEE:
                throw new RuntimeException("Cette tarification est annulée");
            case EXPIRE:
                throw new RuntimeException("Cette tarification a expiré");
        }
    }
}
