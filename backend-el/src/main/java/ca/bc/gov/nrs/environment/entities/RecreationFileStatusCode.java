package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_FILE_STATUS_CODE", schema = "THE")
public class RecreationFileStatusCode {
  @Id
  @Column(name = "RECREATION_FILE_STATUS_CODE", nullable = false, length = 3)
  private String recreationFileStatusCode;

  @Column(name = "DESCRIPTION", nullable = false, length = 120)
  private String description;

  @Column(name = "EFFECTIVE_DATE", nullable = false)
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE", nullable = false)
  private LocalDate expiryDate;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDate updateTimestamp;

  public String getRecreationFileStatusCode() {
    return recreationFileStatusCode;
  }

  public void setRecreationFileStatusCode(String recreationFileStatusCode) {
    this.recreationFileStatusCode = recreationFileStatusCode;
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

  public LocalDate getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDate updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

}
