package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_RISK_EVALUATION", schema = "THE")
public class RecreationRiskEvaluation {
  @Id
  @Column(name = "RISK_EVALUATION_ID", nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_USER_DAYS_CODE", nullable = false)
  private RecreationUserDaysCode recreationUserDaysCode;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RECREATION_OCCUPANCY_CODE", nullable = false)
  private RecreationOccupancyCode recreationOccupancyCode;

  @ColumnDefault("SYSDATE")
  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDate entryTimestamp;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @ColumnDefault("SYSDATE")
  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDate updateTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public RecreationUserDaysCode getRecreationUserDaysCode() {
    return recreationUserDaysCode;
  }

  public void setRecreationUserDaysCode(RecreationUserDaysCode recreationUserDaysCode) {
    this.recreationUserDaysCode = recreationUserDaysCode;
  }

  public RecreationOccupancyCode getRecreationOccupancyCode() {
    return recreationOccupancyCode;
  }

  public void setRecreationOccupancyCode(RecreationOccupancyCode recreationOccupancyCode) {
    this.recreationOccupancyCode = recreationOccupancyCode;
  }

  public LocalDate getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDate entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public String getEntryUserid() {
    return entryUserid;
  }

  public void setEntryUserid(String entryUserid) {
    this.entryUserid = entryUserid;
  }

  public LocalDate getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDate updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }

}
