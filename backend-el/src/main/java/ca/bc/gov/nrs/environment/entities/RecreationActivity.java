package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_ACTIVITY", schema = "THE")
public class RecreationActivity {
  @EmbeddedId
  private RecreationActivityId id;

  @MapsId("forestFileId")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "FOREST_FILE_ID", nullable = false)
  private RecreationProject forestFile;

  @MapsId("recreationActivityCode")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_ACTIVITY_CODE", nullable = false)
  private RecreationActivityCode recreationActivityCode;

  @Column(name = "ACTIVITY_RANK")
  private Boolean activityRank;

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

  public RecreationActivityId getId() {
    return id;
  }

  public void setId(RecreationActivityId id) {
    this.id = id;
  }

  public RecreationProject getForestFile() {
    return forestFile;
  }

  public void setForestFile(RecreationProject forestFile) {
    this.forestFile = forestFile;
  }

  public RecreationActivityCode getRecreationActivityCode() {
    return recreationActivityCode;
  }

  public void setRecreationActivityCode(RecreationActivityCode recreationActivityCode) {
    this.recreationActivityCode = recreationActivityCode;
  }

  public Boolean getActivityRank() {
    return activityRank;
  }

  public void setActivityRank(Boolean activityRank) {
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
