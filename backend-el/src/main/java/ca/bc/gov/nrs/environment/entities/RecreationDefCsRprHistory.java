package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_DEF_CS_RPR_HISTORY", schema = "THE")
public class RecreationDefCsRprHistory {
  @EmbeddedId
  private RecreationDefCsRprHistoryId id;

  @Column(name = "RECREATION_REMED_REPAIR_CODE", nullable = false, length = 2)
  private String recreationRemedRepairCode;

  @Column(name = "ESTIMATED_REPAIR_COST", precision = 7, scale = 2)
  private BigDecimal estimatedRepairCost;

  @Column(name = "REPAIR_COMPLETE_DATE", nullable = false)
  private LocalDate repairCompleteDate;

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

  public RecreationDefCsRprHistoryId getId() {
    return id;
  }

  public void setId(RecreationDefCsRprHistoryId id) {
    this.id = id;
  }

  public String getRecreationRemedRepairCode() {
    return recreationRemedRepairCode;
  }

  public void setRecreationRemedRepairCode(String recreationRemedRepairCode) {
    this.recreationRemedRepairCode = recreationRemedRepairCode;
  }

  public BigDecimal getEstimatedRepairCost() {
    return estimatedRepairCost;
  }

  public void setEstimatedRepairCost(BigDecimal estimatedRepairCost) {
    this.estimatedRepairCost = estimatedRepairCost;
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

}
