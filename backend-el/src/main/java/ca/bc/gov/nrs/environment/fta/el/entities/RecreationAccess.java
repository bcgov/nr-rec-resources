package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.Immutable;

import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_ACCESS", schema = "THE")
@Immutable
public class RecreationAccess {

  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "RECREATION_SUB_ACCESS_CODE", nullable = false, length = 3)
  private String recreationSubAccessCode;


  @Column(name = "RECREATION_ACCESS_CODE", nullable = false, length = 3)
  private String recreationAccessCode;



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


  public String getRecreationAccessCode() {
    return recreationAccessCode;
  }

  public void setRecreationAccessCode(String recreationAccessCode) {
    this.recreationAccessCode = recreationAccessCode;
  }

  public String getRecreationSubAccessCode() {
    return recreationSubAccessCode;
  }

  public void setRecreationSubAccessCode(String recreationSubAccessCode) {
    this.recreationSubAccessCode = recreationSubAccessCode;
  }

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
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
