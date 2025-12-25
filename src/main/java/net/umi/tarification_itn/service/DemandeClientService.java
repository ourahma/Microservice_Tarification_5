package net.umi.tarification_itn.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.DemandeDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import org.springframework.core.ParameterizedTypeReference;


@Service
@RequiredArgsConstructor
@Slf4j
public class DemandeClientService {

    private final WebClient webClient;

    @Value("${spring.microservices.demande.base-url}")
    private String demandeBaseUrl;


    public List<DemandeDTO> getAllDemandes(String token) {
        log.info("Récupération de toutes les demandes");
        log.info("Token : "+token);
        try{
            List<DemandeDTO> demandes = webClient.get()
                    .uri(demandeBaseUrl)
                    .header(HttpHeaders.AUTHORIZATION, token)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<DemandeDTO>>() {})
                    .block();

            if(demandes == null) return new ArrayList<>();
            return demandes;
        } catch (Exception e) {
            log.error("Erreur lors de l'appel au microservice demandes: {}", e.getMessage());
            throw new RuntimeException(e);
        }

    }

    public DemandeDTO getDemandeById(Long demandeId, String token) {
        log.info("Récupération de la demande: {}", demandeId);

        return webClient.get()
                .uri(demandeBaseUrl + "/{id}", demandeId)
                .header(HttpHeaders.AUTHORIZATION,token)
                .retrieve()
                .bodyToMono(DemandeDTO.class)
                .block();
    }
}