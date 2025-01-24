package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_DEFINED_CAMPSITE", schema = "THE")
public class RecreationDefinedCampsite {
  @EmbeddedId
  private RecreationDefinedCampsiteId id;

  @MapsId("forestFileId")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "FOREST_FILE_ID", nullable = false)
  private RecreationProject forestFile;

  @Column(name = "ESTIMATED_REPAIR_COST", precision = 7, scale = 2)
  private BigDecimal estimatedRepairCost;

  @ManyToOne(fetch = FetchType.LAZY)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_REMED_REPAIR_CODE")
  private RecreationRemedRepairCode recreationRemedRepairCode;

  @Column(name = "REPAIR_COMPLETE_DATE")
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

  public RecreationDefinedCampsiteId getId() {
    return id;
  }

  public void setId(RecreationDefinedCampsiteId id) {
    this.id = id;
  }

  public RecreationProject getForestFile() {
    return forestFile;
  }

  public void setForestFile(RecreationProject forestFile) {
    this.forestFile = forestFile;
  }

  public BigDecimal getEstimatedRepairCost() {
    return estimatedRepairCost;
  }

  public void setEstimatedRepairCost(BigDecimal estimatedRepairCost) {
    this.estimatedRepairCost = estimatedRepairCost;
  }

  public RecreationRemedRepairCode getRecreationRemedRepairCode() {
    return recreationRemedRepairCode;
  }

  public void setRecreationRemedRepairCode(RecreationRemedRepairCode recreationRemedRepairCode) {
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
