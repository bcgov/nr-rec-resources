package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "PROV_FOREST_USE", schema = "THE")
@Immutable
public class ProvForestUse {

  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "FILE_STATUS_ST", length = 3)
  private String fileStatusCode;

  @Column(name = "FILE_STATUS_DATE")
  private LocalDateTime fileStatusDate;

  @Column(name = "FILE_TYPE_CODE", length = 10)
  private String fileTypeCode;

  @Column(name = "FOREST_REGION")
  private Integer forestRegion;

  @Column(name = "BCTS_ORG_UNIT")
  private Long bctsOrgUnit;

  @Column(name = "SB_FUNDED_IND", nullable = false, length = 1)
  private String sbFundedInd;

  @Column(name = "DISTRICT_ADMIN_ZONE", length = 4)
  private String districtAdminZone;

  @Column(name = "MGMT_UNIT_TYPE", length = 1)
  private String mgmtUnitType;

  @Column(name = "MGMT_UNIT_ID")
  private Integer mgmtUnitId;

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

  @Column(name = "FOREST_TENURE_GUID", nullable = false)
  private byte[] forestTenureGuid;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getFileStatusCode() {
    return fileStatusCode;
  }

  public void setFileStatusCode(String fileStatusCode) {
    this.fileStatusCode = fileStatusCode;
  }

  public LocalDateTime getFileStatusDate() {
    return fileStatusDate;
  }

  public void setFileStatusDate(LocalDateTime fileStatusDate) {
    this.fileStatusDate = fileStatusDate;
  }

  public String getFileTypeCode() {
    return fileTypeCode;
  }

  public void setFileTypeCode(String fileTypeCode) {
    this.fileTypeCode = fileTypeCode;
  }

  public Integer getForestRegion() {
    return forestRegion;
  }

  public void setForestRegion(Integer forestRegion) {
    this.forestRegion = forestRegion;
  }

  public Long getBctsOrgUnit() {
    return bctsOrgUnit;
  }

  public void setBctsOrgUnit(Long bctsOrgUnit) {
    this.bctsOrgUnit = bctsOrgUnit;
  }

  public String getSbFundedInd() {
    return sbFundedInd;
  }

  public void setSbFundedInd(String sbFundedInd) {
    this.sbFundedInd = sbFundedInd;
  }

  public String getDistrictAdminZone() {
    return districtAdminZone;
  }

  public void setDistrictAdminZone(String districtAdminZone) {
    this.districtAdminZone = districtAdminZone;
  }

  public String getMgmtUnitType() {
    return mgmtUnitType;
  }

  public void setMgmtUnitType(String mgmtUnitType) {
    this.mgmtUnitType = mgmtUnitType;
  }

  public Integer getMgmtUnitId() {
    return mgmtUnitId;
  }

  public void setMgmtUnitId(Integer mgmtUnitId) {
    this.mgmtUnitId = mgmtUnitId;
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

  public byte[] getForestTenureGuid() {
    return forestTenureGuid;
  }

  public void setForestTenureGuid(byte[] forestTenureGuid) {
    this.forestTenureGuid = forestTenureGuid;
  }
}
