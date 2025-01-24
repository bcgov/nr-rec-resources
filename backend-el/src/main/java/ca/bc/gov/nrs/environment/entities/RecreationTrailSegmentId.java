package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationTrailSegmentId implements Serializable {
  private static final long serialVersionUID = 8172608485025258328L;
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "RECREATION_TRAIL_SEG_ID", nullable = false)
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
