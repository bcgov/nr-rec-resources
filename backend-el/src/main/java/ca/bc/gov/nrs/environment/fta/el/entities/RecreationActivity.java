package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_ACTIVITY", schema = "THE")
@Immutable
@IdClass(RecreationActivityId.class)
public class RecreationActivity {

  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false)
  private String forestFileId;

  @Id
  @Column(name = "RECREATION_ACTIVITY_CODE", nullable = false)
  private String recreationActivityCode;

  @Column(name = "ACTIVITY_RANK")
  private Integer activityRank;

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

  public String getRecreationActivityCode() {
    return recreationActivityCode;
  }

  public void setRecreationActivityCode(String recreationActivityCode) {
    this.recreationActivityCode = recreationActivityCode;
  }

  public Integer getActivityRank() {
    return activityRank;
  }

  public void setActivityRank(Integer activityRank) {
    this.activityRank = activityRank;
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
