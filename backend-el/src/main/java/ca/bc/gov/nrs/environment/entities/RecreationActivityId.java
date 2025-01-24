package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationActivityId implements Serializable {
  private static final long serialVersionUID = 2726276541645918046L;
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "RECREATION_ACTIVITY_CODE", nullable = false, length = 3)
  private String recreationActivityCode;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getRecreationActivityCode() {
    return recreationActivityCode;
  }

  public void setRecreationActivityCode(String recreationActivityCode) {
    this.recreationActivityCode = recreationActivityCode;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationActivityId entity = (RecreationActivityId) o;
    return Objects.equals(this.recreationActivityCode, entity.recreationActivityCode) &&
      Objects.equals(this.forestFileId, entity.forestFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationActivityCode, forestFileId);
  }

}
