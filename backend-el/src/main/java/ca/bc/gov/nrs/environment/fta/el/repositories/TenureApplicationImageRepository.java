package ca.bc.gov.nrs.environment.fta.el.repositories;

import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplicationImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface TenureApplicationImageRepository extends JpaRepository<TenureApplicationImage, Long> {

  @Query(value = """
      SELECT tai.*
      FROM THE.TENURE_APPLICATION ta
      JOIN THE.TENURE_APPLICATION_IMAGE tai ON ta.TENURE_APP_ID = tai.TENURE_APP_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (:typeCodes)
      ORDER BY tai.TENURE_APP_ID
      """, nativeQuery = true)
  List<TenureApplicationImage> findAllByTenureApplicationTypeCodes(@Param("typeCodes") Collection<String> typeCodes);
}
