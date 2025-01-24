package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "TENURE_APPLICATION_MAP_FEATURE", schema = "THE")
public class TenureApplicationMapFeature {
  @Id
  @Column(name = "MAP_FEATURE_ID", nullable = false)
  private Long id;

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
  private Short fsrGravelPitNo;

  @Column(name = "CHART_AREA_ID", length = 3)
  private String chartAreaId;

  @Column(name = "MAP_BLOCK_ID", length = 10)
  private String mapBlockId;

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

  @Column(name = "REFER_TO_FILE_NUMBER_DESC")
  private String referToFileNumberDesc;

  @Column(name = "POINT_OF_COMMENCEMENT", length = 2000)
  private String pointOfCommencement;

  @Column(name = "IMAGE_HEIGHT")
  private Short imageHeight;

  @Column(name = "IMAGE_WIDTH")
  private Short imageWidth;

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

  @Column(name = "OWNED_BY_FILE", length = 10)
  private String ownedByFile;

  @Column(name = "OWNED_BY_CP", length = 3)
  private String ownedByCp;

  @Column(name = "MANAGED_BY_FILE", length = 10)
  private String managedByFile;

  @Column(name = "MANAGED_BY_CP", length = 3)
  private String managedByCp;

  @Column(name = "OBSERVATION_DATE")
  private LocalDate observationDate;

  @Column(name = "DATA_QUALITY_COMMENT")
  private String dataQualityComment;

  @Column(name = "PLANNED_NET_BLOCK_AREA", precision = 11, scale = 4)
  private BigDecimal plannedNetBlockArea;

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
  private LocalDate updateTimestamp;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDate entryTimestamp;

  @ColumnDefault("SYS_GUID()")
  @Column(name = "MAP_FEATURE_GUID", nullable = false)
  private byte[] mapFeatureGuid;

  @Column(name = "FEATURE_RECORD_GUID")
  private byte[] featureRecordGuid;

  @Column(name = "BUSINESS_FEATURE_IDENTIFIER", length = 100)
  private String businessFeatureIdentifier;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getPermitBlockId() {
    return permitBlockId;
  }

  public void setPermitBlockId(String permitBlockId) {
    this.permitBlockId = permitBlockId;
  }

  public String getCuttingPermitId() {
    return cuttingPermitId;
  }

  public void setCuttingPermitId(String cuttingPermitId) {
    this.cuttingPermitId = cuttingPermitId;
  }

  public String getCutBlockId() {
    return cutBlockId;
  }

  public void setCutBlockId(String cutBlockId) {
    this.cutBlockId = cutBlockId;
  }

  public String getRoadSectionId() {
    return roadSectionId;
  }

  public void setRoadSectionId(String roadSectionId) {
    this.roadSectionId = roadSectionId;
  }

  public String getAmendmentId() {
    return amendmentId;
  }

  public void setAmendmentId(String amendmentId) {
    this.amendmentId = amendmentId;
  }

  public String getFsrDedicationPlanId() {
    return fsrDedicationPlanId;
  }

  public void setFsrDedicationPlanId(String fsrDedicationPlanId) {
    this.fsrDedicationPlanId = fsrDedicationPlanId;
  }

  public Short getFsrGravelPitNo() {
    return fsrGravelPitNo;
  }

  public void setFsrGravelPitNo(Short fsrGravelPitNo) {
    this.fsrGravelPitNo = fsrGravelPitNo;
  }

  public String getChartAreaId() {
    return chartAreaId;
  }

  public void setChartAreaId(String chartAreaId) {
    this.chartAreaId = chartAreaId;
  }

  public String getMapBlockId() {
    return mapBlockId;
  }

  public void setMapBlockId(String mapBlockId) {
    this.mapBlockId = mapBlockId;
  }

  public Integer getMinX() {
    return minX;
  }

  public void setMinX(Integer minX) {
    this.minX = minX;
  }

  public Integer getMaxX() {
    return maxX;
  }

  public void setMaxX(Integer maxX) {
    this.maxX = maxX;
  }

  public Integer getMinY() {
    return minY;
  }

  public void setMinY(Integer minY) {
    this.minY = minY;
  }

  public Integer getMaxY() {
    return maxY;
  }

  public void setMaxY(Integer maxY) {
    this.maxY = maxY;
  }

  public String getBcgsMapSheetReference() {
    return bcgsMapSheetReference;
  }

  public void setBcgsMapSheetReference(String bcgsMapSheetReference) {
    this.bcgsMapSheetReference = bcgsMapSheetReference;
  }

  public String getReferToFileNumberDesc() {
    return referToFileNumberDesc;
  }

  public void setReferToFileNumberDesc(String referToFileNumberDesc) {
    this.referToFileNumberDesc = referToFileNumberDesc;
  }

  public String getPointOfCommencement() {
    return pointOfCommencement;
  }

  public void setPointOfCommencement(String pointOfCommencement) {
    this.pointOfCommencement = pointOfCommencement;
  }

  public Short getImageHeight() {
    return imageHeight;
  }

  public void setImageHeight(Short imageHeight) {
    this.imageHeight = imageHeight;
  }

  public Short getImageWidth() {
    return imageWidth;
  }

  public void setImageWidth(Short imageWidth) {
    this.imageWidth = imageWidth;
  }

  public BigDecimal getMetersPerPixel() {
    return metersPerPixel;
  }

  public void setMetersPerPixel(BigDecimal metersPerPixel) {
    this.metersPerPixel = metersPerPixel;
  }

  public BigDecimal getObjectArea() {
    return objectArea;
  }

  public void setObjectArea(BigDecimal objectArea) {
    this.objectArea = objectArea;
  }

  public BigDecimal getChartVolume() {
    return chartVolume;
  }

  public void setChartVolume(BigDecimal chartVolume) {
    this.chartVolume = chartVolume;
  }

  public Integer getImageScale() {
    return imageScale;
  }

  public void setImageScale(Integer imageScale) {
    this.imageScale = imageScale;
  }

  public BigDecimal getObjectLength() {
    return objectLength;
  }

  public void setObjectLength(BigDecimal objectLength) {
    this.objectLength = objectLength;
  }

  public String getReferenceName() {
    return referenceName;
  }

  public void setReferenceName(String referenceName) {
    this.referenceName = referenceName;
  }

  public String getOwnedByFile() {
    return ownedByFile;
  }

  public void setOwnedByFile(String ownedByFile) {
    this.ownedByFile = ownedByFile;
  }

  public String getOwnedByCp() {
    return ownedByCp;
  }

  public void setOwnedByCp(String ownedByCp) {
    this.ownedByCp = ownedByCp;
  }

  public String getManagedByFile() {
    return managedByFile;
  }

  public void setManagedByFile(String managedByFile) {
    this.managedByFile = managedByFile;
  }

  public String getManagedByCp() {
    return managedByCp;
  }

  public void setManagedByCp(String managedByCp) {
    this.managedByCp = managedByCp;
  }

  public LocalDate getObservationDate() {
    return observationDate;
  }

  public void setObservationDate(LocalDate observationDate) {
    this.observationDate = observationDate;
  }

  public String getDataQualityComment() {
    return dataQualityComment;
  }

  public void setDataQualityComment(String dataQualityComment) {
    this.dataQualityComment = dataQualityComment;
  }

  public BigDecimal getPlannedNetBlockArea() {
    return plannedNetBlockArea;
  }

  public void setPlannedNetBlockArea(BigDecimal plannedNetBlockArea) {
    this.plannedNetBlockArea = plannedNetBlockArea;
  }

  public String getOverlayGeoDistrictCode() {
    return overlayGeoDistrictCode;
  }

  public void setOverlayGeoDistrictCode(String overlayGeoDistrictCode) {
    this.overlayGeoDistrictCode = overlayGeoDistrictCode;
  }

  public String getBcgsMapsheetNo() {
    return bcgsMapsheetNo;
  }

  public void setBcgsMapsheetNo(String bcgsMapsheetNo) {
    this.bcgsMapsheetNo = bcgsMapsheetNo;
  }

  public String getTsaNumber() {
    return tsaNumber;
  }

  public void setTsaNumber(String tsaNumber) {
    this.tsaNumber = tsaNumber;
  }

  public String getLandDistrict() {
    return landDistrict;
  }

  public void setLandDistrict(String landDistrict) {
    this.landDistrict = landDistrict;
  }

  public String getPulpwoodAgreement() {
    return pulpwoodAgreement;
  }

  public void setPulpwoodAgreement(String pulpwoodAgreement) {
    this.pulpwoodAgreement = pulpwoodAgreement;
  }

  public Integer getUtmZone() {
    return utmZone;
  }

  public void setUtmZone(Integer utmZone) {
    this.utmZone = utmZone;
  }

  public Integer getRevisionCount() {
    return revisionCount;
  }

  public void setRevisionCount(Integer revisionCount) {
    this.revisionCount = revisionCount;
  }

  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }

  public LocalDate getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDate updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

  public String getEntryUserid() {
    return entryUserid;
  }

  public void setEntryUserid(String entryUserid) {
    this.entryUserid = entryUserid;
  }

  public LocalDate getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDate entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public byte[] getMapFeatureGuid() {
    return mapFeatureGuid;
  }

  public void setMapFeatureGuid(byte[] mapFeatureGuid) {
    this.mapFeatureGuid = mapFeatureGuid;
  }

  public byte[] getFeatureRecordGuid() {
    return featureRecordGuid;
  }

  public void setFeatureRecordGuid(byte[] featureRecordGuid) {
    this.featureRecordGuid = featureRecordGuid;
  }

  public String getBusinessFeatureIdentifier() {
    return businessFeatureIdentifier;
  }

  public void setBusinessFeatureIdentifier(String businessFeatureIdentifier) {
    this.businessFeatureIdentifier = businessFeatureIdentifier;
  }

}
