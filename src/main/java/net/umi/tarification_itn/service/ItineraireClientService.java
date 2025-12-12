package net.umi.tarification_itn.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.umi.tarification_itn.model.dto.ItineraireDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItineraireClientService {

    private final WebClient webClient;

    @Value("${spring.microservices.itineraire.base-url}")
    private String itineraireBaseUrl;

    public ItineraireDTO getItineraireById(String itineraireId, String token) {
        log.info("Récupération de l'itinéraire: {}", itineraireId);

        // Construire l'URL correcte selon votre configuration
        String url = itineraireBaseUrl;
        if (!itineraireBaseUrl.contains("/routes")) {
            url = itineraireBaseUrl + "/routes";
        }

        return webClient.get()
                .uri(url + "/{id}", itineraireId)
                .header(HttpHeaders.AUTHORIZATION,
                        token)
                .retrieve()
                .bodyToMono(ItineraireDTO.class)
                .block();
    }


}
