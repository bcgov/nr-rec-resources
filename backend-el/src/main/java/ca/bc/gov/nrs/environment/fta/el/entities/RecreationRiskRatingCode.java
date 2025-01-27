package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_RISK_RATING_CODE", schema = "THE")
public class RecreationRiskRatingCode {
  @Id
  @Column(name = "RECREATION_RISK_RATING_CODE", nullable = false, length = 3)
  private String recreationRiskRatingCode;

  @Column(name = "DESCRIPTION", nullable = false, length = 120)
  private String description;

  @Column(name = "EFFECTIVE_DATE", nullable = false)
  private LocalDateTime effectiveDate;

  @Column(name = "EXPIRY_DATE", nullable = false)
  private LocalDateTime expiryDate;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  public String getRecreationRiskRatingCode() {
    return recreationRiskRatingCode;
  }

  public void setRecreationRiskRatingCode(String recreationRiskRatingCode) {
    this.recreationRiskRatingCode = recreationRiskRatingCode;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public LocalDateTime getEffectiveDate() {
    return effectiveDate;
  }

  public void setEffectiveDate(LocalDateTime effectiveDate) {
    this.effectiveDate = effectiveDate;
  }

  public LocalDateTime getExpiryDate() {
    return expiryDate;
  }

  public void setExpiryDate(LocalDateTime expiryDate) {
    this.expiryDate = expiryDate;
  }

  public LocalDateTime getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }
}
