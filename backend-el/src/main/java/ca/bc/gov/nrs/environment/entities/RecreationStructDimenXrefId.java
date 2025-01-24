package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationStructDimenXrefId implements Serializable {
  private static final long serialVersionUID = -225592125291924496L;
  @Column(name = "RECREATION_STRUCTURE_CODE", nullable = false, length = 3)
  private String recreationStructureCode;

  @Column(name = "RECREATION_STRUCT_DIMEN_CODE", nullable = false, length = 2)
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
