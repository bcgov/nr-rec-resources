package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationDistrictXrefId implements Serializable {
  private static final long serialVersionUID = 1394298598976783762L;
  @Column(name = "RECREATION_DISTRICT_CODE", nullable = false, length = 4)
  private String recreationDistrictCode;

  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  public String getRecreationDistrictCode() {
    return recreationDistrictCode;
  }

  public void setRecreationDistrictCode(String recreationDistrictCode) {
    this.recreationDistrictCode = recreationDistrictCode;
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
    RecreationDistrictXrefId entity = (RecreationDistrictXrefId) o;
    return Objects.equals(this.recreationDistrictCode, entity.recreationDistrictCode) &&
      Objects.equals(this.forestFileId, entity.forestFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationDistrictCode, forestFileId);
  }

}
