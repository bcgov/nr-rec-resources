package ca.bc.gov.nrs.environment.fta.el.entities;

import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class RecreationTrailSegmentId implements Serializable {
  @Serial
  private static final long serialVersionUID = -1099384178230297419L;
  private String forestFileId;

  private Long recreationTrailSegId;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public Long getRecreationTrailSegId() {
    return recreationTrailSegId;
  }

  public void setRecreationTrailSegId(Long recreationTrailSegId) {
    this.recreationTrailSegId = recreationTrailSegId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationTrailSegmentId entity = (RecreationTrailSegmentId) o;
    return Objects.equals(this.forestFileId, entity.forestFileId) &&
      Objects.equals(this.recreationTrailSegId, entity.recreationTrailSegId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(forestFileId, recreationTrailSegId);
  }

}
