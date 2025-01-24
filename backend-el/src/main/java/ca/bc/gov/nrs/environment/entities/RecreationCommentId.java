package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationCommentId implements Serializable {
  private static final long serialVersionUID = -2298046347355881569L;
  @Column(name = "RECREATION_COMMENT_ID", nullable = false)
  private Long recreationCommentId;

  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
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
