package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_PROJECT", schema = "THE")
@Immutable
public class RecreationProject {
  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "PROJECT_NAME", nullable = false, length = 100)
  private String projectName;

  @Column(name = "RECREATION_CONTROL_ACCESS_CODE")
  private String recreationControlAccessCode;

  @Column(name = "RECREATION_FEATURE_CODE")
  private String recreationFeatureCode;

  @Column(name = "RECREATION_MAINTAIN_STD_CODE")
  private String recreationMaintainStdCode;

  @Column(name = "RECREATION_RISK_RATING_CODE")
  private String recreationRiskRatingCode;

  @Column(name = "UTM_ZONE")
  private Integer utmZone;

  @Column(name = "LAST_REC_INSPECTION_DATE")
  private LocalDateTime lastRecInspectionDate;

  @Column(name = "REC_PROJECT_SKEY")
  private Long recProjectSkey;

  @Column(name = "RESOURCE_FEATURE_IND", nullable = false, length = 1)
  private String resourceFeatureInd;

  @Column(name = "LAST_HZRD_TREE_ASSESS_DATE")
  private LocalDateTime lastHzrdTreeAssessDate;

  @Column(name = "SITE_DESCRIPTION", length = 500)
  private String siteDescription;

  @Column(name = "RECREATION_USER_DAYS_CODE")
  private String recreationUserDaysCode;

  @Column(name = "OVERFLOW_CAMPSITES")
  private Integer overflowCampsites;

  @Column(name = "UTM_NORTHING")
  private Long utmNorthing;

  @Column(name = "UTM_EASTING")
  private Long utmEasting;

  @Column(name = "RIGHT_OF_WAY", precision = 7, scale = 1)
  private BigDecimal rightOfWay;

  @Column(name = "ARCH_IMPACT_ASSESS_IND", length = 1)
  private String archImpactAssessInd;

  @Column(name = "SITE_LOCATION", length = 500)
  private String siteLocation;

  @Column(name = "PROJECT_ESTABLISHED_DATE")
  private LocalDateTime projectEstablishedDate;

  @Column(name = "RECREATION_VIEW_IND", nullable = false, length = 1)
  private String recreationViewInd;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  @Column(name = "ARCH_IMPACT_DATE")
  private LocalDateTime archImpactDate;

  @Column(name = "BORDEN_NO", length = 200)
  private String bordenNo;

  @Column(name = "CAMP_HOST_IND", nullable = false, length = 1)
  private String campHostInd;

  @Column(name = "LOW_MOBILITY_ACCESS_IND", nullable = false, length = 1)
  private String lowMobilityAccessInd;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getProjectName() {
    return projectName;
  }

  public void setProjectName(String projectName) {
    this.projectName = projectName;
  }

  public String getRecreationControlAccessCode() {
    return recreationControlAccessCode;
  }

  public void setRecreationControlAccessCode(String recreationControlAccessCode) {
    this.recreationControlAccessCode = recreationControlAccessCode;
  }

  public String getRecreationFeatureCode() {
    return recreationFeatureCode;
  }

  public void setRecreationFeatureCode(String recreationFeatureCode) {
    this.recreationFeatureCode = recreationFeatureCode;
  }

  public String getRecreationMaintainStdCode() {
    return recreationMaintainStdCode;
  }

  public void setRecreationMaintainStdCode(String recreationMaintainStdCode) {
    this.recreationMaintainStdCode = recreationMaintainStdCode;
  }

  public String getRecreationRiskRatingCode() {
    return recreationRiskRatingCode;
  }

  public void setRecreationRiskRatingCode(String recreationRiskRatingCode) {
    this.recreationRiskRatingCode = recreationRiskRatingCode;
  }

  public Integer getUtmZone() {
    return utmZone;
  }

  public void setUtmZone(Integer utmZone) {
    this.utmZone = utmZone;
  }

  public LocalDateTime getLastRecInspectionDate() {
    return lastRecInspectionDate;
  }

  public void setLastRecInspectionDate(LocalDateTime lastRecInspectionDate) {
    this.lastRecInspectionDate = lastRecInspectionDate;
  }

  public Long getRecProjectSkey() {
    return recProjectSkey;
  }

  public void setRecProjectSkey(Long recProjectSkey) {
    this.recProjectSkey = recProjectSkey;
  }

  public String getResourceFeatureInd() {
    return resourceFeatureInd;
  }

  public void setResourceFeatureInd(String resourceFeatureInd) {
    this.resourceFeatureInd = resourceFeatureInd;
  }

  public LocalDateTime getLastHzrdTreeAssessDate() {
    return lastHzrdTreeAssessDate;
  }

  public void setLastHzrdTreeAssessDate(LocalDateTime lastHzrdTreeAssessDate) {
    this.lastHzrdTreeAssessDate = lastHzrdTreeAssessDate;
  }

  public String getSiteDescription() {
    return siteDescription;
  }

  public void setSiteDescription(String siteDescription) {
    this.siteDescription = siteDescription;
  }

  public String getRecreationUserDaysCode() {
    return recreationUserDaysCode;
  }

  public void setRecreationUserDaysCode(String recreationUserDaysCode) {
    this.recreationUserDaysCode = recreationUserDaysCode;
  }

  public Integer getOverflowCampsites() {
    return overflowCampsites;
  }

  public void setOverflowCampsites(Integer overflowCampsites) {
    this.overflowCampsites = overflowCampsites;
  }

  public Long getUtmNorthing() {
    return utmNorthing;
  }

  public void setUtmNorthing(Long utmNorthing) {
    this.utmNorthing = utmNorthing;
  }

  public Long getUtmEasting() {
    return utmEasting;
  }

  public void setUtmEasting(Long utmEasting) {
    this.utmEasting = utmEasting;
  }

  public BigDecimal getRightOfWay() {
    return rightOfWay;
  }

  public void setRightOfWay(BigDecimal rightOfWay) {
    this.rightOfWay = rightOfWay;
  }

  public String getArchImpactAssessInd() {
    return archImpactAssessInd;
  }

  public void setArchImpactAssessInd(String archImpactAssessInd) {
    this.archImpactAssessInd = archImpactAssessInd;
  }

  public String getSiteLocation() {
    return siteLocation;
  }

  public void setSiteLocation(String siteLocation) {
    this.siteLocation = siteLocation;
  }

  public LocalDateTime getProjectEstablishedDate() {
    return projectEstablishedDate;
  }

  public void setProjectEstablishedDate(LocalDateTime projectEstablishedDate) {
    this.projectEstablishedDate = projectEstablishedDate;
  }

  public String getRecreationViewInd() {
    return recreationViewInd;
  }

  public void setRecreationViewInd(String recreationViewInd) {
    this.recreationViewInd = recreationViewInd;
  }

  public Integer getRevisionCount() {
    return revisionCount;
  }

  public void setRevisionCount(Integer revisionCount) {
    this.revisionCount = revisionCount;
  }

  public String getEntryUserid() {
    return entryUserid;
  }

  public void setEntryUserid(String entryUserid) {
    this.entryUserid = entryUserid;
  }

  public LocalDateTime getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }

  public LocalDateTime getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

  public LocalDateTime getArchImpactDate() {
    return archImpactDate;
  }

  public void setArchImpactDate(LocalDateTime archImpactDate) {
    this.archImpactDate = archImpactDate;
  }

  public String getBordenNo() {
    return bordenNo;
  }

  public void setBordenNo(String bordenNo) {
    this.bordenNo = bordenNo;
  }

  public String getCampHostInd() {
    return campHostInd;
  }

  public void setCampHostInd(String campHostInd) {
    this.campHostInd = campHostInd;
  }

  public String getLowMobilityAccessInd() {
    return lowMobilityAccessInd;
  }

  public void setLowMobilityAccessInd(String lowMobilityAccessInd) {
    this.lowMobilityAccessInd = lowMobilityAccessInd;
  }
}
