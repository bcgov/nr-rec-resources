package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationAccessXrefId implements Serializable {
  private static final long serialVersionUID = 8191536631852661034L;
  @Column(name = "RECREATION_ACCESS_CODE", nullable = false, length = 3)
  private String recreationAccessCode;

  @Column(name = "RECREATION_SUB_ACCESS_CODE", nullable = false, length = 3)
  private String recreationSubAccessCode;

  public String getRecreationAccessCode() {
    return recreationAccessCode;
  }

  public void setRecreationAccessCode(String recreationAccessCode) {
    this.recreationAccessCode = recreationAccessCode;
  }

  public String getRecreationSubAccessCode() {
    return recreationSubAccessCode;
  }

  public void setRecreationSubAccessCode(String recreationSubAccessCode) {
    this.recreationSubAccessCode = recreationSubAccessCode;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationAccessXrefId entity = (RecreationAccessXrefId) o;
    return Objects.equals(this.recreationSubAccessCode, entity.recreationSubAccessCode) &&
      Objects.equals(this.recreationAccessCode, entity.recreationAccessCode);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationSubAccessCode, recreationAccessCode);
  }

}
