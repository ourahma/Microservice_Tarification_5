package net.umi.tarification_itn.repository;

import net.umi.tarification_itn.model.entity.ParametreTarif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParametreTarifRepository extends JpaRepository<ParametreTarif, String> {

    List<ParametreTarif> findByActifTrue();

    ParametreTarif findByCode(String code);
}