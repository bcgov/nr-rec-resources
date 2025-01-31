package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_COMMENT", schema = "THE")
@Immutable
@IdClass(RecreationCommentId.class)
public class RecreationComment {

  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Id
  @Column(name = "RECREATION_COMMENT_ID", nullable = false)
  private Long recreationCommentId;

  @Column(name = "REC_COMMENT_TYPE_CODE", nullable = false, length = 1)
  private String recCommentTypeCode;

  @ColumnDefault("'N'")
  @Column(name = "CLOSURE_IND", nullable = false, length = 1)
  private String closureInd;

  @Column(name = "PROJECT_COMMENT", nullable = false, length = 2000)
  private String projectComment;

  @Column(name = "COMMENT_DATE")
  private LocalDate commentDate;

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

  public Long getRecreationCommentId() {
    return recreationCommentId;
  }

  public void setRecreationCommentId(Long recreationCommentId) {
    this.recreationCommentId = recreationCommentId;
  }

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getClosureInd() {
    return closureInd;
  }

  public void setClosureInd(String closureInd) {
    this.closureInd = closureInd;
  }

  public String getProjectComment() {
    return projectComment;
  }

  public void setProjectComment(String projectComment) {
    this.projectComment = projectComment;
  }

  public LocalDate getCommentDate() {
    return commentDate;
  }

  public void setCommentDate(LocalDate commentDate) {
    this.commentDate = commentDate;
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

  public String getRecCommentTypeCode() {
    return recCommentTypeCode;
  }

  public void setRecCommentTypeCode(String recCommentTypeCode) {
    this.recCommentTypeCode = recCommentTypeCode;
  }
}
