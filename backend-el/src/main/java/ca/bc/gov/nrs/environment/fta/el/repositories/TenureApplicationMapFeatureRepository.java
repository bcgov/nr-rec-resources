package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplicationMapFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface TenureApplicationMapFeatureRepository extends JpaRepository<TenureApplicationMapFeature, Long> {

  @Query(value = """
      SELECT tamf.*
      FROM THE.TENURE_APPLICATION ta
      JOIN THE.TENURE_APPLICATION_MAP_FEATURE tamf ON ta.TENURE_APP_ID = tamf.TENURE_APP_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (:typeCodes)
      ORDER BY tamf.MAP_FEATURE_ID
      """, nativeQuery = true)
  List<TenureApplicationMapFeature> findAllByTenureApplicationTypeCodes(@Param("typeCodes") Collection<String> typeCodes);
}
