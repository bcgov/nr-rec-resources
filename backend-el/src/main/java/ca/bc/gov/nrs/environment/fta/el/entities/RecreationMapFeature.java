package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDate;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_MAP_FEATURE", schema = "THE")
@Immutable
public class RecreationMapFeature {
  @Id
  @Column(name = "RMF_SKEY", nullable = false)
  private Long id;
  @Column(name = "FOREST_FILE_ID", nullable = false)
  private String forestFileId;
  @Column(name = "SECTION_ID", length = 30)
  private String sectionId;

  @Column(name = "AMENDMENT_ID", nullable = false)
  private Long amendmentId;
  @Column(name = "AMEND_STATUS_CODE", length = 30)
  private String amendStatusCode;

  @Column(name = "RECREATION_MAP_FEATURE_CODE", nullable = false)
  private String recreationMapFeatureCode;

  @Column(name = "CURRENT_IND", nullable = false, length = 1)
  private String currentInd;

  @Column(name = "AMEND_STATUS_DATE", nullable = false)
  private LocalDate amendStatusDate;

  @Column(name = "RETIREMENT_DATE")
  private LocalDate retirementDate;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDate entryTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDate updateTimestamp;

  @ColumnDefault("SYS_GUID()")
  @Column(name = "RECREATION_MAP_FEATURE_GUID", nullable = false)
  private byte[] recreationMapFeatureGuid;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getSectionId() {
    return sectionId;
  }

  public void setSectionId(String sectionId) {
    this.sectionId = sectionId;
  }

  public Long getAmendmentId() {
    return amendmentId;
  }

  public void setAmendmentId(Long amendmentId) {
    this.amendmentId = amendmentId;
  }

  public String getRecreationMapFeatureCode() {
    return recreationMapFeatureCode;
  }

  public void setRecreationMapFeatureCode(String recreationMapFeatureCode) {
    this.recreationMapFeatureCode = recreationMapFeatureCode;
  }

  public String getCurrentInd() {
    return currentInd;
  }

  public void setCurrentInd(String currentInd) {
    this.currentInd = currentInd;
  }

  public LocalDate getAmendStatusDate() {
    return amendStatusDate;
  }

  public void setAmendStatusDate(LocalDate amendStatusDate) {
    this.amendStatusDate = amendStatusDate;
  }

  public LocalDate getRetirementDate() {
    return retirementDate;
  }

  public void setRetirementDate(LocalDate retirementDate) {
    this.retirementDate = retirementDate;
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

  public LocalDate getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDate entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
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

  public byte[] getRecreationMapFeatureGuid() {
    return recreationMapFeatureGuid;
  }

  public void setRecreationMapFeatureGuid(byte[] recreationMapFeatureGuid) {
    this.recreationMapFeatureGuid = recreationMapFeatureGuid;
  }

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getAmendStatusCode() {
    return amendStatusCode;
  }

  public void setAmendStatusCode(String amendStatusCode) {
    this.amendStatusCode = amendStatusCode;
  }
}
