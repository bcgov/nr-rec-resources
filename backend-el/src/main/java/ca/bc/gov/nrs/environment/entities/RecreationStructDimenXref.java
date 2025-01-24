package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_STRUCT_DIMEN_XREF", schema = "THE")
public class RecreationStructDimenXref {
  @EmbeddedId
  private RecreationStructDimenXrefId id;

  @MapsId("recreationStructureCode")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_STRUCTURE_CODE", nullable = false)
  private RecreationStructureCode recreationStructureCode;

  @MapsId("recreationStructDimenCode")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_STRUCT_DIMEN_CODE", nullable = false)
  private RecreationStructDimenCode recreationStructDimenCode;

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

  public RecreationStructDimenXrefId getId() {
    return id;
  }

  public void setId(RecreationStructDimenXrefId id) {
    this.id = id;
  }

  public RecreationStructureCode getRecreationStructureCode() {
    return recreationStructureCode;
  }

  public void setRecreationStructureCode(RecreationStructureCode recreationStructureCode) {
    this.recreationStructureCode = recreationStructureCode;
  }

  public RecreationStructDimenCode getRecreationStructDimenCode() {
    return recreationStructDimenCode;
  }

  public void setRecreationStructDimenCode(RecreationStructDimenCode recreationStructDimenCode) {
    this.recreationStructDimenCode = recreationStructDimenCode;
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
