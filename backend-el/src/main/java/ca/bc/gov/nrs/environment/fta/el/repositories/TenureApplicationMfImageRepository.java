package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplicationMfImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface TenureApplicationMfImageRepository extends JpaRepository<TenureApplicationMfImage, Long> {

  @Query(value = """
      SELECT tami.*
      FROM THE.TENURE_APPLICATION ta
      JOIN THE.TENURE_APPLICATION_MAP_FEATURE tamf ON ta.TENURE_APP_ID = tamf.TENURE_APP_ID
      JOIN THE.TENURE_APPLICATION_MF_IMAGE tami ON tamf.MAP_FEATURE_ID = tami.MAP_FEATURE_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (:typeCodes)
      ORDER BY tami.MAP_FEATURE_ID
      """, nativeQuery = true)
  List<TenureApplicationMfImage> findAllByTenureApplicationTypeCodes(@Param("typeCodes") Collection<String> typeCodes);
}

