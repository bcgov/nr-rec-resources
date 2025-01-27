package ca.bc.gov.nrs.environment.fta.el.entities;

import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class RecreationPlanId implements Serializable {
  @Serial
  private static final long serialVersionUID = -4646888367946816978L;
  private String forestFileId;

  private Long recProjectSkey;

  private String planTypeCode;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public Long getRecProjectSkey() {
    return recProjectSkey;
  }

  public void setRecProjectSkey(Long recProjectSkey) {
    this.recProjectSkey = recProjectSkey;
  }

  public String getPlanTypeCode() {
    return planTypeCode;
  }

  public void setPlanTypeCode(String planTypeCode) {
    this.planTypeCode = planTypeCode;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreationPlanId entity = (RecreationPlanId) o;
    return Objects.equals(this.planTypeCode, entity.planTypeCode) &&
      Objects.equals(this.forestFileId, entity.forestFileId) &&
      Objects.equals(this.recProjectSkey, entity.recProjectSkey);
  }

  @Override
  public int hashCode() {
    return Objects.hash(planTypeCode, forestFileId, recProjectSkey);
  }

}
