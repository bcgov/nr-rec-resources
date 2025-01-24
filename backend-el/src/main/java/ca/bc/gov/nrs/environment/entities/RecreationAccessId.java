package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecreationAccessId implements Serializable {
  private static final long serialVersionUID = 8260044437565255491L;
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "RECREATION_SUB_ACCESS_CODE", nullable = false, length = 3)
  private String recreationSubAccessCode;

  @Column(name = "RECREATION_ACCESS_CODE", nullable = false, length = 3)
  private String recreationAccessCode;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getRecreationSubAccessCode() {
    return recreationSubAccessCode;
  }

  public void setRecreationSubAccessCode(String recreationSubAccessCode) {
    this.recreationSubAccessCode = recreationSubAccessCode;
  }

  public String getRecreationAccessCode() {
    return recreationAccessCode;
  }

  public void setRecreationAccessCode(String recreationAccessCode) {
    this.recreationAccessCode = recreationAccessCode;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationAccessId entity = (RecreationAccessId) o;
    return Objects.equals(this.recreationSubAccessCode, entity.recreationSubAccessCode) &&
      Objects.equals(this.forestFileId, entity.forestFileId) &&
      Objects.equals(this.recreationAccessCode, entity.recreationAccessCode);
  }

  @Override
  public int hashCode() {
    return Objects.hash(recreationSubAccessCode, forestFileId, recreationAccessCode);
  }

}
