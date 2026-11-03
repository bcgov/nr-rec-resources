package ca.bc.gov.nrs.environment.fta.el.entities;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TENURE_APPLICATION_MAP_FEATURE", schema = "THE")
@Immutable
public class TenureApplicationMapFeature {

  @Id
  @Column(name = "MAP_FEATURE_ID", nullable = false)
  private Long mapFeatureId;

  @Column(name = "TENURE_APP_ID", nullable = false)
  private Long tenureAppId;

  @Column(name = "FOREST_FILE_ID", length = 10)
  private String forestFileId;

  @Column(name = "PERMIT_BLOCK_ID", length = 4)
  private String permitBlockId;

  @Column(name = "CUTTING_PERMIT_ID", length = 3)
  private String cuttingPermitId;

  @Column(name = "CUT_BLOCK_ID", length = 10)
  private String cutBlockId;

  @Column(name = "ROAD_SECTION_ID", length = 30)
  private String roadSectionId;

  @Column(name = "AMENDMENT_ID", length = 5)
  private String amendmentId;

  @Column(name = "FSR_DEDICATION_PLAN_ID", length = 30)
  private String fsrDedicationPlanId;

  @Column(name = "FSR_GRAVEL_PIT_NO")
  private Integer fsrGravelPitNo;

  @Column(name = "CHART_AREA_ID", length = 3)
  private String chartAreaId;

  @Column(name = "MAP_BLOCK_ID", length = 10)
  private String mapBlockId;

  @Column(name = "PROV_FOREST_CONFLICT_CODE", length = 3)
  private String provForestConflictCode;

  @Column(name = "TENURE_APP_PURP_CODE", nullable = false, length = 3)
  private String tenureAppPurpCode;

  @Column(name = "MIN_X", nullable = false)
  private Integer minX;

  @Column(name = "MAX_X", nullable = false)
  private Integer maxX;

  @Column(name = "MIN_Y", nullable = false)
  private Integer minY;

  @Column(name = "MAX_Y", nullable = false)
  private Integer maxY;

  @Column(name = "BCGS_MAP_SHEET_REFERENCE", length = 15)
  private String bcgsMapSheetReference;

  @Column(name = "REFER_TO_FILE_NUMBER_DESC", length = 255)
  private String referToFileNumberDesc;

  @Column(name = "POINT_OF_COMMENCEMENT", length = 2000)
  private String pointOfCommencement;

  @Column(name = "IMAGE_HEIGHT")
  private Integer imageHeight;

  @Column(name = "IMAGE_WIDTH")
  private Integer imageWidth;

  @Column(name = "METERS_PER_PIXEL", precision = 10, scale = 3)
  private BigDecimal metersPerPixel;

  @Column(name = "OBJECT_AREA", precision = 15, scale = 4)
  private BigDecimal objectArea;

  @Column(name = "CHART_VOLUME", precision = 11, scale = 4)
  private BigDecimal chartVolume;

  @Column(name = "IMAGE_SCALE")
  private Integer imageScale;

  @Column(name = "OBJECT_LENGTH", precision = 15, scale = 4)
  private BigDecimal objectLength;

  @Column(name = "REFERENCE_NAME", length = 50)
  private String referenceName;

  @Column(name = "FEATURE_TYPE_CODE", length = 3)
  private String featureTypeCode;

  @Column(name = "OWNED_BY_FILE", length = 10)
  private String ownedByFile;

  @Column(name = "OWNED_BY_CP", length = 3)
  private String ownedByCp;

  @Column(name = "MANAGED_BY_FILE", length = 10)
  private String managedByFile;

  @Column(name = "MANAGED_BY_CP", length = 3)
  private String managedByCp;

  @Column(name = "OBSERVATION_DATE")
  private LocalDateTime observationDate;

  @Column(name = "DATA_SOURCE_CODE", length = 10)
  private String dataSourceCode;

  @Column(name = "DATA_QUALITY_COMMENT", length = 255)
  private String dataQualityComment;

  @Column(name = "CAPTURE_METHOD_CODE", length = 30)
  private String captureMethodCode;

  @Column(name = "FEATURE_CLASS_SKEY")
  private Long featureClassSkey;

  @Column(name = "PLANNED_NET_BLOCK_AREA", precision = 11, scale = 4)
  private BigDecimal plannedNetBlockArea;

  @Column(name = "IMAGE_MIME_TYPE_CODE", length = 3)
  private String imageMimeTypeCode;

  @Column(name = "IMAGE_MAP_SIZE_CODE", length = 1)
  private String imageMapSizeCode;

  @Column(name = "IMAGE_ORIENTATION_CODE", length = 1)
  private String imageOrientationCode;

  @Column(name = "OVERLAY_GEO_DISTRICT_CODE", length = 6)
  private String overlayGeoDistrictCode;

  @Column(name = "BCGS_MAPSHEET_NO", length = 32)
  private String bcgsMapsheetNo;

  @Column(name = "TSA_NUMBER", length = 2)
  private String tsaNumber;

  @Column(name = "LAND_DISTRICT", length = 50)
  private String landDistrict;

  @Column(name = "PULPWOOD_AGREEMENT", length = 20)
  private String pulpwoodAgreement;

  @Column(name = "UTM_ZONE")
  private Integer utmZone;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "MAP_FEATURE_GUID", nullable = false)
  private byte[] mapFeatureGuid;

  @Column(name = "FEATURE_RECORD_GUID")
  private byte[] featureRecordGuid;

  @Column(name = "BUSINESS_FEATURE_IDENTIFIER", length = 100)
  private String businessFeatureIdentifier;

  public Long getMapFeatureId() {
    return mapFeatureId;
  }

  public void setMapFeatureId(Long mapFeatureId) {
    this.mapFeatureId = mapFeatureId;
  }

  public Long getTenureAppId() {
    return tenureAppId;
  }

  public void setTenureAppId(Long tenureAppId) {
    this.tenureAppId = tenureAppId;
  }
}
