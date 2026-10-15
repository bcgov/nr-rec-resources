package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

/**
 * No surrogate key exists, so the file id, source code and associated file id
 * together identify a row.
 *
 * Field order here sets the CSV header order, which the fta mirror table has to
 * match: the Postgres import is positional.
 */
@Entity
@Table(name = "ASSOCIATED_USE", schema = "THE")
@Immutable
@IdClass(AssociatedUseId.class)
public class AssociatedUse {

  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Id
  @Column(name = "FILE_SOURCE_CODE", nullable = false, length = 1)
  private String fileSourceCode;

  @Id
  @Column(name = "ASSOCIATED_FILE_ID", nullable = false, length = 30)
  private String associatedFileId;

  @Column(name = "FILE_ASSOCIATION_TYPE_CODE", length = 3)
  private String fileAssociationTypeCode;

  @Column(name = "ASSOCIATION_END_DATE")
  private LocalDateTime associationEndDate;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getFileSourceCode() {
    return fileSourceCode;
  }

  public void setFileSourceCode(String fileSourceCode) {
    this.fileSourceCode = fileSourceCode;
  }

  public String getAssociatedFileId() {
    return associatedFileId;
  }

  public void setAssociatedFileId(String associatedFileId) {
    this.associatedFileId = associatedFileId;
  }

  public String getFileAssociationTypeCode() {
    return fileAssociationTypeCode;
  }

  public void setFileAssociationTypeCode(String fileAssociationTypeCode) {
    this.fileAssociationTypeCode = fileAssociationTypeCode;
  }

  public LocalDateTime getAssociationEndDate() {
    return associationEndDate;
  }

  public void setAssociationEndDate(LocalDateTime associationEndDate) {
    this.associationEndDate = associationEndDate;
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

  public Integer getRevisionCount() {
    return revisionCount;
  }

  public void setRevisionCount(Integer revisionCount) {
    this.revisionCount = revisionCount;
  }
}
