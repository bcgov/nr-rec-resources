package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.Immutable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_STRUCTURE", schema = "THE")
@Immutable
public class RecreationStructure {
  @Id
  @Column(name = "STRUCTURE_ID", nullable = false)
  private Long id;

  @Column(name = "FOREST_FILE_ID", nullable = false)
  private String forestFile;

  @Column(name = "CAMPSITE_FOREST_FILE_ID")
  private String campSiteForestFileId;

  @Column(name = "RECREATION_STRUCTURE_CODE")
  private String recreationStructureCode;

  @Column(name = "STRUCTURE_NAME", nullable = false, length = 100)
  private String structureName;

  @Column(name = "STRUCTURE_COUNT")
  private Short structureCount;

  @Column(name = "STRUCTURE_LENGTH", precision = 7, scale = 1)
  private BigDecimal structureLength;

  @Column(name = "STRUCTURE_WIDTH", precision = 7, scale = 1)
  private BigDecimal structureWidth;

  @Column(name = "STRUCTURE_AREA", precision = 7, scale = 1)
  private BigDecimal structureArea;

  @Column(name = "ACTUAL_VALUE", precision = 7, scale = 2)
  private BigDecimal actualValue;

  @Column(name = "CAMPSITE_NUMBER", precision = 7, scale = 2)
  private Short campSiteNumber;

  @Column(name = "RECREATION_REMED_REPAIR_CODE")
  private String recreationRemedRepairCode;

  @Column(name = "ESTIMATED_REPAIR_COST", precision = 10, scale = 2)
  private BigDecimal estimatedRepairCost;

  @Column(name = "REPAIR_COMPLETED_DATE")
  private LocalDateTime repairCompletedDate;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getForestFile() {
    return forestFile;
  }

  public void setForestFile(String forestFile) {
    this.forestFile = forestFile;
  }

  public String getCampSiteForestFileId() {
    return campSiteForestFileId;
  }

  public void setCampSiteForestFileId(String campSiteForestFileId) {
    this.campSiteForestFileId = campSiteForestFileId;
  }

  public String getRecreationStructureCode() {
    return recreationStructureCode;
  }

  public void setRecreationStructureCode(String recreationStructureCode) {
    this.recreationStructureCode = recreationStructureCode;
  }

  public String getStructureName() {
    return structureName;
  }

  public void setStructureName(String structureName) {
    this.structureName = structureName;
  }

  public Short getStructureCount() {
    return structureCount;
  }

  public void setStructureCount(Short structureCount) {
    this.structureCount = structureCount;
  }

  public BigDecimal getStructureLength() {
    return structureLength;
  }

  public void setStructureLength(BigDecimal structureLength) {
    this.structureLength = structureLength;
  }

  public BigDecimal getStructureWidth() {
    return structureWidth;
  }

  public void setStructureWidth(BigDecimal structureWidth) {
    this.structureWidth = structureWidth;
  }

  public BigDecimal getStructureArea() {
    return structureArea;
  }

  public void setStructureArea(BigDecimal structureArea) {
    this.structureArea = structureArea;
  }

  public BigDecimal getActualValue() {
    return actualValue;
  }

  public void setActualValue(BigDecimal actualValue) {
    this.actualValue = actualValue;
  }

  public Short getCampSiteNumber() {
    return campSiteNumber;
  }

  public void setCampSiteNumber(Short campSiteNumber) {
    this.campSiteNumber = campSiteNumber;
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

  public LocalDateTime getRepairCompletedDate() {
    return repairCompletedDate;
  }

  public void setRepairCompletedDate(LocalDateTime repairCompletedDate) {
    this.repairCompletedDate = repairCompletedDate;
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

  public LocalDateTime getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }
}
