package ca.bc.gov.nrs.environment.fta.el.entities;

import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class RecreationAttachmentContentId implements Serializable {
  @Serial
  private static final long serialVersionUID = 7981889210675273052L;
  private String forestFileId;

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
    RecreationAttachmentContentId entity = (RecreationAttachmentContentId) o;
    return Objects.equals(this.recreationAttachmentId, entity.recreationAttachmentId) &&
      Objects.equals(this.forestFileId, entity.forestFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationAttachmentId, forestFileId);
  }

}
