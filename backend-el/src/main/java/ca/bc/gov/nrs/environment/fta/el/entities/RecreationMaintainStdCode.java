package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.Immutable;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_MAINTAIN_STD_CODE", schema = "THE")
@Immutable
public class RecreationMaintainStdCode {
  @Id
  @Column(name = "RECREATION_MAINTAIN_STD_CODE", nullable = false, length = 1)
  private String recreationMaintainStdCode;

  @Column(name = "DESCRIPTION", nullable = false, length = 120)
  private String description;

  @Column(name = "EFFECTIVE_DATE", nullable = false)
  private LocalDateTime effectiveDate;

  @Column(name = "EXPIRY_DATE", nullable = false)
  private LocalDateTime expiryDate;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  public String getRecreationMaintainStdCode() {
    return recreationMaintainStdCode;
  }

  public void setRecreationMaintainStdCode(String recreationMaintainStdCode) {
    this.recreationMaintainStdCode = recreationMaintainStdCode;
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
