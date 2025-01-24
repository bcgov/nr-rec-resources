package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_TRAIL_SEGMENT", schema = "THE")
public class RecreationTrailSegment {
  @EmbeddedId
  private RecreationTrailSegmentId id;

  @MapsId("forestFileId")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "FOREST_FILE_ID", nullable = false)
  private RecreationProject forestFile;

  @Column(name = "TRAIL_SEGMENT_NAME", nullable = false, length = 50)
  private String trailSegmentName;

  @Column(name = "START_STATION", precision = 11, scale = 4)
  private BigDecimal startStation;

  @Column(name = "END_STATION", precision = 11, scale = 4)
  private BigDecimal endStation;

  @ManyToOne(fetch = FetchType.LAZY)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_REMED_REPAIR_CODE")
  private RecreationRemedRepairCode recreationRemedRepairCode;

  @Column(name = "ESTIMATED_REPAIR_COST", precision = 10, scale = 2)
  private BigDecimal estimatedRepairCost;

  @Column(name = "ACTUAL_REPAIR_COST", precision = 10, scale = 2)
  private BigDecimal actualRepairCost;

  @Column(name = "REPAIR_COMPLETED_DATE")
  private LocalDate repairCompletedDate;

  @Column(name = "WHEELCHAIR_ACCESSIBLE_IND", length = 1)
  private String wheelchairAccessibleInd;

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

  public RecreationTrailSegmentId getId() {
    return id;
  }

  public void setId(RecreationTrailSegmentId id) {
    this.id = id;
  }

  public RecreationProject getForestFile() {
    return forestFile;
  }

  public void setForestFile(RecreationProject forestFile) {
    this.forestFile = forestFile;
  }

  public String getTrailSegmentName() {
    return trailSegmentName;
  }

  public void setTrailSegmentName(String trailSegmentName) {
    this.trailSegmentName = trailSegmentName;
  }

  public BigDecimal getStartStation() {
    return startStation;
  }

  public void setStartStation(BigDecimal startStation) {
    this.startStation = startStation;
  }

  public BigDecimal getEndStation() {
    return endStation;
  }

  public void setEndStation(BigDecimal endStation) {
    this.endStation = endStation;
  }

  public RecreationRemedRepairCode getRecreationRemedRepairCode() {
    return recreationRemedRepairCode;
  }

  public void setRecreationRemedRepairCode(RecreationRemedRepairCode recreationRemedRepairCode) {
    this.recreationRemedRepairCode = recreationRemedRepairCode;
  }

  public BigDecimal getEstimatedRepairCost() {
    return estimatedRepairCost;
  }

  public void setEstimatedRepairCost(BigDecimal estimatedRepairCost) {
    this.estimatedRepairCost = estimatedRepairCost;
  }

  public BigDecimal getActualRepairCost() {
    return actualRepairCost;
  }

  public void setActualRepairCost(BigDecimal actualRepairCost) {
    this.actualRepairCost = actualRepairCost;
  }

  public LocalDate getRepairCompletedDate() {
    return repairCompletedDate;
  }

  public void setRepairCompletedDate(LocalDate repairCompletedDate) {
    this.repairCompletedDate = repairCompletedDate;
  }

  public String getWheelchairAccessibleInd() {
    return wheelchairAccessibleInd;
  }

  public void setWheelchairAccessibleInd(String wheelchairAccessibleInd) {
    this.wheelchairAccessibleInd = wheelchairAccessibleInd;
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
