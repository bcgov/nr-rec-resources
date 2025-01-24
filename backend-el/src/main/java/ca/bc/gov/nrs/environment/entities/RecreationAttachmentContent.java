package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "RECREATION_ATTACHMENT_CONTENT", schema = "THE")
public class RecreationAttachmentContent {
  @EmbeddedId
  private RecreationAttachmentContentId id;

  @MapsId("id")
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  private RecreationAttachment recreationAttachment;

  @Column(name = "ATTACHMENT_CONTENT", nullable = false)
  private byte[] attachmentContent;

  public RecreationAttachmentContentId getId() {
    return id;
  }

  public void setId(RecreationAttachmentContentId id) {
    this.id = id;
  }

  public RecreationAttachment getRecreationAttachment() {
    return recreationAttachment;
  }

  public void setRecreationAttachment(RecreationAttachment recreationAttachment) {
    this.recreationAttachment = recreationAttachment;
  }

  public byte[] getAttachmentContent() {
    return attachmentContent;
  }

  public void setAttachmentContent(byte[] attachmentContent) {
    this.attachmentContent = attachmentContent;
  }

}
