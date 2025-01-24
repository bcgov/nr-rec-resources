package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_OBJECTIVE", schema = "THE")
public class RecreationObjective {
  @Id
  @Column(name = "OBJECTIVE_ID", nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "FOREST_FILE_ID", nullable = false)
  private RecreationProject forestFile;

  @Column(name = "OBJECTIVE_DESCRIPTION", nullable = false, length = 2000)
  private String objectiveDescription;

  @Column(name = "OBJECTIVE_ESTABLISHED_DATE", nullable = false)
  private LocalDate objectiveEstablishedDate;

  @Column(name = "OBJECTIVE_AMENDED_DATE")
  private LocalDate objectiveAmendedDate;

  @Column(name = "OBJECTIVE_CANCELLED_DATE")
  private LocalDate objectiveCancelledDate;

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

  public String getObjectiveDescription() {
    return objectiveDescription;
  }

  public void setObjectiveDescription(String objectiveDescription) {
    this.objectiveDescription = objectiveDescription;
  }

  public LocalDate getObjectiveEstablishedDate() {
    return objectiveEstablishedDate;
  }

  public void setObjectiveEstablishedDate(LocalDate objectiveEstablishedDate) {
    this.objectiveEstablishedDate = objectiveEstablishedDate;
  }

  public LocalDate getObjectiveAmendedDate() {
    return objectiveAmendedDate;
  }

  public void setObjectiveAmendedDate(LocalDate objectiveAmendedDate) {
    this.objectiveAmendedDate = objectiveAmendedDate;
  }

  public LocalDate getObjectiveCancelledDate() {
    return objectiveCancelledDate;
  }

  public void setObjectiveCancelledDate(LocalDate objectiveCancelledDate) {
    this.objectiveCancelledDate = objectiveCancelledDate;
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
