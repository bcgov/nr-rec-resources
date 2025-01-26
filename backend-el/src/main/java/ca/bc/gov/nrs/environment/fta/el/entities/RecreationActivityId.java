package ca.bc.gov.nrs.environment.fta.el.entities;

import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class RecreationActivityId implements Serializable {
  @Serial
  private static final long serialVersionUID = -4549438959474117743L;
  private String forestFileId;

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
    if (this == o)
      return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o))
      return false;
    RecreationActivityId entity = (RecreationActivityId) o;
    return Objects.equals(this.recreationActivityCode, entity.recreationActivityCode) &&
        Objects.equals(this.forestFileId, entity.forestFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationActivityCode, forestFileId);
  }

}
