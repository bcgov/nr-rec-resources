package ca.bc.gov.nrs.environment.fta.el.entities;

import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class RecreationStructDimenXrefId implements Serializable {
  @Serial
  private static final long serialVersionUID = 476163311662687673L;
  private String recreationStructureCode;

  private String recreationStructDimenCode;

  public String getRecreationStructureCode() {
    return recreationStructureCode;
  }

  public void setRecreationStructureCode(String recreationStructureCode) {
    this.recreationStructureCode = recreationStructureCode;
  }

  public String getRecreationStructDimenCode() {
    return recreationStructDimenCode;
  }

  public void setRecreationStructDimenCode(String recreationStructDimenCode) {
    this.recreationStructDimenCode = recreationStructDimenCode;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationStructDimenXrefId entity = (RecreationStructDimenXrefId) o;
    return Objects.equals(this.recreationStructureCode, entity.recreationStructureCode) &&
      Objects.equals(this.recreationStructDimenCode, entity.recreationStructDimenCode);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationStructureCode, recreationStructDimenCode);
  }

}
