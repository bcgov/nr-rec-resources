package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_TRAIL_SEGMENT", schema = "THE")
@Immutable
@IdClass(RecreationTrailSegmentId.class)
public class RecreationTrailSegment {

  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Id
  @Column(name = "RECREATION_TRAIL_SEG_ID", nullable = false)
  private Long recreationTrailSegId;


  @Column(name = "TRAIL_SEGMENT_NAME", nullable = false, length = 50)
  private String trailSegmentName;

  @Column(name = "START_STATION", precision = 11, scale = 4)
  private BigDecimal startStation;

  @Column(name = "END_STATION", precision = 11, scale = 4)
  private BigDecimal endStation;

  @Column(name = "RECREATION_REMED_REPAIR_CODE")
  private String recreationRemedRepairCode;

  @Column(name = "ESTIMATED_REPAIR_COST", precision = 10, scale = 2)
  private BigDecimal estimatedRepairCost;

  @Column(name = "ACTUAL_REPAIR_COST", precision = 10, scale = 2)
  private BigDecimal actualRepairCost;

  @Column(name = "REPAIR_COMPLETED_DATE")
  private LocalDateTime repairCompletedDate;

  @Column(name = "WHEELCHAIR_ACCESSIBLE_IND", length = 1)
  private String wheelchairAccessibleInd;

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

  public Long getRecreationTrailSegId() {
    return recreationTrailSegId;
  }

  public void setRecreationTrailSegId(Long recreationTrailSegId) {
    this.recreationTrailSegId = recreationTrailSegId;
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

  public BigDecimal getActualRepairCost() {
    return actualRepairCost;
  }

  public void setActualRepairCost(BigDecimal actualRepairCost) {
    this.actualRepairCost = actualRepairCost;
  }

  public LocalDateTime getRepairCompletedDate() {
    return repairCompletedDate;
  }

  public void setRepairCompletedDate(LocalDateTime repairCompletedDate) {
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
