package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_MAP_FEATURE_CODE", schema = "THE")
@Immutable
public class RecreationMapFeatureCode {
  @Id
  @Column(name = "RECREATION_MAP_FEATURE_CODE", nullable = false, length = 3)
  private String recreationMapFeatureCode;

  @Column(name = "DESCRIPTION", nullable = false, length = 120)
  private String description;

  @Column(name = "EFFECTIVE_DATE", nullable = false)
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE", nullable = false)
  private LocalDate expiryDate;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  public String getRecreationMapFeatureCode() {
    return recreationMapFeatureCode;
  }

  public void setRecreationMapFeatureCode(String recreationMapFeatureCode) {
    this.recreationMapFeatureCode = recreationMapFeatureCode;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public LocalDate getEffectiveDate() {
    return effectiveDate;
  }

  public void setEffectiveDate(LocalDate effectiveDate) {
    this.effectiveDate = effectiveDate;
  }

  public LocalDate getExpiryDate() {
    return expiryDate;
  }

  public void setExpiryDate(LocalDate expiryDate) {
    this.expiryDate = expiryDate;
  }

  public LocalDateTime getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }
}
