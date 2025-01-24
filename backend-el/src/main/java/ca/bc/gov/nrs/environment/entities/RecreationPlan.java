package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_PLAN", schema = "THE")
public class RecreationPlan {
  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "REC_PROJECT_SKEY", nullable = false)
  private Long recProjectSkey;

  @Column(name = "PLAN_TYPE_CODE", nullable = false, length = 1)
  private String planTypeCode;

  @Column(name = "REMARKS", nullable = false, length = 254)
  private String remarks;

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

  public String getRemarks() {
    return remarks;
  }

  public void setRemarks(String remarks) {
    this.remarks = remarks;
  }

}
