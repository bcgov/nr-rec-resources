package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.Immutable;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_DISTRICT_CODE", schema = "THE")
@Immutable
public class RecreationDistrictCode {
  @Id
  @Column(name = "RECREATION_DISTRICT_CODE", nullable = false, length = 4)
  private String recreationDistrictCode;

  @Column(name = "DESCRIPTION", nullable = false, length = 120)
  private String description;

  @Column(name = "EFFECTIVE_DATE", nullable = false)
  private LocalDateTime effectiveDate;

  @Column(name = "EXPIRY_DATE", nullable = false)
  private LocalDateTime expiryDate;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  public String getRecreationDistrictCode() {
    return recreationDistrictCode;
  }

  public void setRecreationDistrictCode(String recreationDistrictCode) {
    this.recreationDistrictCode = recreationDistrictCode;
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
