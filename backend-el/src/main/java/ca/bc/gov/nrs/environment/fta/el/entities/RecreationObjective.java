package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_OBJECTIVE", schema = "THE")
@Immutable
public class RecreationObjective {
  @Id
  @Column(name = "OBJECTIVE_ID", nullable = false)
  private Long id;

  @Column(name = "FOREST_FILE_ID", nullable = false)
  private String forestFile;

  @Column(name = "OBJECTIVE_DESCRIPTION", nullable = false, length = 2000)
  private String objectiveDescription;

  @Column(name = "OBJECTIVE_ESTABLISHED_DATE", nullable = false)
  private LocalDate objectiveEstablishedDate;

  @Column(name = "OBJECTIVE_AMENDED_DATE")
  private LocalDate objectiveAmendedDate;

  @Column(name = "OBJECTIVE_CANCELLED_DATE")
  private LocalDateTime objectiveCancelledDate;

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

  public LocalDateTime getObjectiveCancelledDate() {
    return objectiveCancelledDate;
  }

  public void setObjectiveCancelledDate(LocalDateTime objectiveCancelledDate) {
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
