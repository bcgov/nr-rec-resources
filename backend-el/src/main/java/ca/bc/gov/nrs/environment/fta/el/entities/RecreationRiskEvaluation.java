package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.Immutable;

import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATION_RISK_EVALUATION", schema = "THE")
@Immutable
public class RecreationRiskEvaluation {
  @Id
  @Column(name = "RISK_EVALUATION_ID", nullable = false)
  private Long id;

  @Column(name = "RECREATION_USER_DAYS_CODE", nullable = false)
  private String recreationUserDaysCode;

  @Column(name = "RECREATION_OCCUPANCY_CODE", nullable = false)
  private String recreationOccupancyCode;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getRecreationUserDaysCode() {
    return recreationUserDaysCode;
  }

  public void setRecreationUserDaysCode(String recreationUserDaysCode) {
    this.recreationUserDaysCode = recreationUserDaysCode;
  }

  public String getRecreationOccupancyCode() {
    return recreationOccupancyCode;
  }

  public void setRecreationOccupancyCode(String recreationOccupancyCode) {
    this.recreationOccupancyCode = recreationOccupancyCode;
  }

  public LocalDateTime getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public String getEntryUserid() {
    return entryUserid;
  }

  public void setEntryUserid(String entryUserid) {
    this.entryUserid = entryUserid;
  }

  public LocalDateTime getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }
}
