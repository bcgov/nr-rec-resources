package ca.bc.gov.nrs.environment.fta.el.entities;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

import org.hibernate.Hibernate;

public class RecreationDistrictXrefId implements Serializable {
  @Serial
  private static final long serialVersionUID = 851404823896192963L;
  private String forestFileId;
  private String recreationDistrictCode;


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
