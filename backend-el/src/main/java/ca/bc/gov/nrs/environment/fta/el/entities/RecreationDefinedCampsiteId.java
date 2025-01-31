package ca.bc.gov.nrs.environment.fta.el.entities;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

import org.hibernate.Hibernate;

public class RecreationDefinedCampsiteId implements Serializable {
  @Serial
  private static final long serialVersionUID = 4135952463920080432L;
  private String forestFileId;

  private Short campsiteNumber;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public Short getCampsiteNumber() {
    return campsiteNumber;
  }

  public void setCampsiteNumber(Short campsiteNumber) {
    this.campsiteNumber = campsiteNumber;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationDefinedCampsiteId entity = (RecreationDefinedCampsiteId) o;
    return Objects.equals(this.campsiteNumber, entity.campsiteNumber) &&
      Objects.equals(this.forestFileId, entity.forestFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(campsiteNumber, forestFileId);
  }

}
