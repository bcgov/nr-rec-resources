package ca.bc.gov.nrs.environment.fta.el.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_DEFINED_CAMPSITE", schema = "THE")
@Immutable
@IdClass(RecreationDefinedCampsiteId.class)
public class RecreationDefinedCampsite {
  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Id
  @Column(name = "CAMPSITE_NUMBER", nullable = false)
  private Short campsiteNumber;


  @Column(name = "ESTIMATED_REPAIR_COST", precision = 7, scale = 2)
  private BigDecimal estimatedRepairCost;

  @Column(name = "RECREATION_REMED_REPAIR_CODE")
  private String recreationRemedRepairCode;

  @Column(name = "REPAIR_COMPLETE_DATE")
  private LocalDate repairCompleteDate;

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

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public Short getCampsiteNumber() {
    return campsiteNumber;
  }

  public void setCampsiteNumber(Short campsiteNumber) {
    this.campsiteNumber = campsiteNumber;
  }

  public BigDecimal getEstimatedRepairCost() {
    return estimatedRepairCost;
  }

  public void setEstimatedRepairCost(BigDecimal estimatedRepairCost) {
    this.estimatedRepairCost = estimatedRepairCost;
  }

  public String getRecreationRemedRepairCode() {
    return recreationRemedRepairCode;
  }

  public void setRecreationRemedRepairCode(String recreationRemedRepairCode) {
    this.recreationRemedRepairCode = recreationRemedRepairCode;
  }

  public LocalDate getRepairCompleteDate() {
    return repairCompleteDate;
  }

  public void setRepairCompleteDate(LocalDate repairCompleteDate) {
    this.repairCompleteDate = repairCompleteDate;
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
}
