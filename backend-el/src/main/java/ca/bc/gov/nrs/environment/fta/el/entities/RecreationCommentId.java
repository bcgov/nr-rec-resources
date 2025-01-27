package ca.bc.gov.nrs.environment.fta.el.entities;

import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class RecreationCommentId implements Serializable {
  @Serial
  private static final long serialVersionUID = -3501419533934602098L;
  private Long recreationCommentId;

  private String forestFileId;

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

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationCommentId entity = (RecreationCommentId) o;
    return Objects.equals(this.forestFileId, entity.forestFileId) &&
      Objects.equals(this.recreationCommentId, entity.recreationCommentId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(forestFileId, recreationCommentId);
  }

}
