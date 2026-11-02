package ca.bc.gov.nrs.environment.fta.el.services;

import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplication;
import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplicationImage;
import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplicationMapFeature;
import ca.bc.gov.nrs.environment.fta.el.entities.TenureApplicationMfImage;
import ca.bc.gov.nrs.environment.fta.el.repositories.TenureApplicationImageRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.TenureApplicationMapFeatureRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.TenureApplicationMfImageRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.TenureApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TenureApplicationService {

  private static final List<String> EXPORT_TYPE_CODES = List.of("RL", "RPO");

  private final TenureApplicationRepository tenureApplicationRepository;
  private final TenureApplicationMapFeatureRepository tenureApplicationMapFeatureRepository;
  private final TenureApplicationImageRepository tenureApplicationImageRepository;
  private final TenureApplicationMfImageRepository tenureApplicationMfImageRepository;

  public TenureApplicationService(
      TenureApplicationRepository tenureApplicationRepository,
      TenureApplicationMapFeatureRepository tenureApplicationMapFeatureRepository,
      TenureApplicationImageRepository tenureApplicationImageRepository,
      TenureApplicationMfImageRepository tenureApplicationMfImageRepository
  ) {
    this.tenureApplicationRepository = tenureApplicationRepository;
    this.tenureApplicationMapFeatureRepository = tenureApplicationMapFeatureRepository;
    this.tenureApplicationImageRepository = tenureApplicationImageRepository;
    this.tenureApplicationMfImageRepository = tenureApplicationMfImageRepository;
  }

  public List<String> getExportTypeCodes() {
    return EXPORT_TYPE_CODES;
  }

  public List<TenureApplication> findAllTenureApplicationsForExport() {
    return tenureApplicationRepository.findAllByTenureApplicationTypeCodes(EXPORT_TYPE_CODES);
  }

  public List<TenureApplicationMapFeature> findAllTenureApplicationMapFeaturesForExport() {
    return tenureApplicationMapFeatureRepository.findAllByTenureApplicationTypeCodes(EXPORT_TYPE_CODES);
  }

  public List<TenureApplicationImage> findAllTenureApplicationImagesForExport() {
    return tenureApplicationImageRepository.findAllByTenureApplicationTypeCodes(EXPORT_TYPE_CODES);
  }

  public List<TenureApplicationMfImage> findAllTenureApplicationMfImagesForExport() {
    return tenureApplicationMfImageRepository.findAllByTenureApplicationTypeCodes(EXPORT_TYPE_CODES);
  }
}

