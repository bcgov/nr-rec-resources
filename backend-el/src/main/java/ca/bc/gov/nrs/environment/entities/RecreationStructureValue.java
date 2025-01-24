package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_STRUCTURE_VALUE", schema = "THE")
public class RecreationStructureValue {
  @Id
  @Column(name = "RECREATION_STRUCTURE_CODE", nullable = false, length = 3)
  private String recreationStructureCode;

  @MapsId
  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_STRUCTURE_CODE", nullable = false)
  private RecreationStructureCode recreationStructureCode1;

  @Column(name = "STRUCTURE_VALUE", nullable = false, precision = 7, scale = 2)
  private BigDecimal structureValue;

  @ColumnDefault("'U'")
  @Column(name = "DIMENSION", nullable = false, length = 1)
  private String dimension;

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

  public String getRecreationStructureCode() {
    return recreationStructureCode;
  }

  public void setRecreationStructureCode(String recreationStructureCode) {
    this.recreationStructureCode = recreationStructureCode;
  }

  public RecreationStructureCode getRecreationStructureCode1() {
    return recreationStructureCode1;
  }

  public void setRecreationStructureCode1(RecreationStructureCode recreationStructureCode1) {
    this.recreationStructureCode1 = recreationStructureCode1;
  }

  public BigDecimal getStructureValue() {
    return structureValue;
  }

  public void setStructureValue(BigDecimal structureValue) {
    this.structureValue = structureValue;
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
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
