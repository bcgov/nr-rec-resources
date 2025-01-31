package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_ATTACHMENT", schema = "THE")
@Immutable
@IdClass(RecreationAttachmentId.class)
public class RecreationAttachment {
  @Id
  @Column(name = "FOREST_FILE_ID")
  private String forestFileId;

  @Id
  @Column(name = "RECREATION_ATTACHMENT_ID")
  private Long recreationAttachmentId;

  @Column(name = "ATTACHMENT_FILE_NAME", nullable = false, length = 50)
  private String attachmentFileName;

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


  public String getAttachmentFileName() {
    return attachmentFileName;
  }

  public void setAttachmentFileName(String attachmentFileName) {
    this.attachmentFileName = attachmentFileName;
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

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public Long getRecreationAttachmentId() {
    return recreationAttachmentId;
  }

  public void setRecreationAttachmentId(Long recreationAttachmentId) {
    this.recreationAttachmentId = recreationAttachmentId;
  }

  public LocalDateTime getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public LocalDateTime getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }
}
