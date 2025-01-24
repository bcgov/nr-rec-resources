package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_ACCESS_XREF", schema = "THE")
public class RecreationAccessXref {
  @EmbeddedId
  private RecreationAccessXrefId id;

  @MapsId("recreationAccessCode")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_ACCESS_CODE", nullable = false)
  private RecreationAccessCode recreationAccessCode;

  @MapsId("recreationSubAccessCode")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_SUB_ACCESS_CODE", nullable = false)
  private RecreationSubAccessCode recreationSubAccessCode;

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

  public RecreationAccessXrefId getId() {
    return id;
  }

  public void setId(RecreationAccessXrefId id) {
    this.id = id;
  }

  public RecreationAccessCode getRecreationAccessCode() {
    return recreationAccessCode;
  }

  public void setRecreationAccessCode(RecreationAccessCode recreationAccessCode) {
    this.recreationAccessCode = recreationAccessCode;
  }

  public RecreationSubAccessCode getRecreationSubAccessCode() {
    return recreationSubAccessCode;
  }

  public void setRecreationSubAccessCode(RecreationSubAccessCode recreationSubAccessCode) {
    this.recreationSubAccessCode = recreationSubAccessCode;
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
