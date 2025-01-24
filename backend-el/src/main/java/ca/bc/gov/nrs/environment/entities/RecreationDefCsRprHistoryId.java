package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationDefCsRprHistoryId implements Serializable {
  private static final long serialVersionUID = -8624017636986379076L;
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "CAMPSITE_NUMBER", nullable = false)
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
    RecreationDefCsRprHistoryId entity = (RecreationDefCsRprHistoryId) o;
    return Objects.equals(this.campsiteNumber, entity.campsiteNumber) &&
      Objects.equals(this.forestFileId, entity.forestFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(campsiteNumber, forestFileId);
  }

}
