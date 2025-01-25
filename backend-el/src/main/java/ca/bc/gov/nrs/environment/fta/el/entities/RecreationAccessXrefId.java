package ca.bc.gov.nrs.environment.fta.el.entities;

import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class RecreationAccessXrefId implements Serializable {
  @Serial
  private static final long serialVersionUID = -3945253802792345942L;
  private String recreationAccessCode;

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
