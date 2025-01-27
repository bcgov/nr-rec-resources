package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.Immutable;

@Entity
@Table(name = "RECREATION_ATTACHMENT_CONTENT", schema = "THE")
@Immutable
@IdClass(RecreationAttachmentContentId.class)
public class RecreationAttachmentContent {

  @Id
  @Column(name = "FOREST_FILE_ID")
  private String forestFileId;

  @Id
  @Column(name = "RECREATION_ATTACHMENT_ID")
  private Long recreationAttachmentId;


  @Column(name = "ATTACHMENT_CONTENT", nullable = false)
  private byte[] attachmentContent;


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

  public byte[] getAttachmentContent() {
    return attachmentContent;
  }

  public void setAttachmentContent(byte[] attachmentContent) {
    this.attachmentContent = attachmentContent;
  }

}
