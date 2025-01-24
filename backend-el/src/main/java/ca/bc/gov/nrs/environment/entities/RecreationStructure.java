package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_STRUCTURE", schema = "THE")
public class RecreationStructure {
  @Id
  @Column(name = "STRUCTURE_ID", nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "FOREST_FILE_ID", nullable = false)
  private RecreationProject forestFile;

  @ManyToOne(fetch = FetchType.LAZY)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  private RecreationDefinedCampsite recreationDefinedCampsite;

  @ManyToOne(fetch = FetchType.LAZY)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_STRUCTURE_CODE")
  private RecreationStructureCode recreationStructureCode;

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

  @ManyToOne(fetch = FetchType.LAZY)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_REMED_REPAIR_CODE")
  private RecreationRemedRepairCode recreationRemedRepairCode;

  @Column(name = "ESTIMATED_REPAIR_COST", precision = 10, scale = 2)
  private BigDecimal estimatedRepairCost;

  @Column(name = "REPAIR_COMPLETED_DATE")
  private LocalDate repairCompletedDate;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDate updateTimestamp;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDate entryTimestamp;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public RecreationProject getForestFile() {
    return forestFile;
  }

  public void setForestFile(RecreationProject forestFile) {
    this.forestFile = forestFile;
  }

  public RecreationDefinedCampsite getRecreationDefinedCampsite() {
    return recreationDefinedCampsite;
  }

  public void setRecreationDefinedCampsite(RecreationDefinedCampsite recreationDefinedCampsite) {
    this.recreationDefinedCampsite = recreationDefinedCampsite;
  }

  public RecreationStructureCode getRecreationStructureCode() {
    return recreationStructureCode;
  }

  public void setRecreationStructureCode(RecreationStructureCode recreationStructureCode) {
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

  public LocalDate getRepairCompletedDate() {
    return repairCompletedDate;
  }

  public void setRepairCompletedDate(LocalDate repairCompletedDate) {
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

  public LocalDate getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDate updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

  public LocalDate getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDate entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

}
