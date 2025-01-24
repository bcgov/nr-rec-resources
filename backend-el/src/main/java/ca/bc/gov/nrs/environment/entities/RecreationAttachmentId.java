package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationAttachmentId implements Serializable {
  private static final long serialVersionUID = -3618384438620519889L;
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "RECREATION_ATTACHMENT_ID", nullable = false)
  private Long recreationAttachmentId;

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

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationAttachmentId entity = (RecreationAttachmentId) o;
    return Objects.equals(this.recreationAttachmentId, entity.recreationAttachmentId) &&
      Objects.equals(this.forestFileId, entity.forestFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationAttachmentId, forestFileId);
  }

}
