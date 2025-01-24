package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_STRUCT_DIMEN_CODE", schema = "THE")
public class RecreationStructDimenCode {
  @Id
  @Column(name = "RECREATION_STRUCT_DIMEN_CODE", nullable = false, length = 2)
  private String recreationStructDimenCode;

  @Column(name = "DESCRIPTION", nullable = false, length = 120)
  private String description;

  @Column(name = "EFFECTIVE_DATE", nullable = false)
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE", nullable = false)
  private LocalDate expiryDate;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDate updateTimestamp;

  public String getRecreationStructDimenCode() {
    return recreationStructDimenCode;
  }

  public void setRecreationStructDimenCode(String recreationStructDimenCode) {
    this.recreationStructDimenCode = recreationStructDimenCode;
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
