package ca.bc.gov.nrs.environment.fta.el.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_FEE", schema = "THE")
@Immutable
public class RecreationFee {
  @Id
  @Column(name = "FEE_ID", nullable = false)
  private Long id;

  @Column(name = "FOREST_FILE_ID", nullable = false)
  private String forestFile;

  @Column(name = "FEE_AMOUNT", nullable = false, precision = 5, scale = 2)
  private BigDecimal feeAmount;

  @Column(name = "FEE_START_DATE", nullable = false)
  private LocalDate feeStartDate;

  @Column(name = "FEE_END_DATE", nullable = false)
  private LocalDate feeEndDate;

  @ColumnDefault("'N'")
  @Column(name = "MONDAY_IND", nullable = false, length = 1)
  private String mondayInd;

  @ColumnDefault("'N'")
  @Column(name = "TUESDAY_IND", nullable = false, length = 1)
  private String tuesdayInd;

  @ColumnDefault("'N'")
  @Column(name = "WEDNESDAY_IND", nullable = false, length = 1)
  private String wednesdayInd;

  @ColumnDefault("'N'")
  @Column(name = "THURSDAY_IND", nullable = false, length = 1)
  private String thursdayInd;

  @ColumnDefault("'N'")
  @Column(name = "FRIDAY_IND", nullable = false, length = 1)
  private String fridayInd;

  @ColumnDefault("'N'")
  @Column(name = "SATURDAY_IND", nullable = false, length = 1)
  private String saturdayInd;

  @ColumnDefault("'N'")
  @Column(name = "SUNDAY_IND", nullable = false, length = 1)
  private String sundayInd;

  @Column(name = "RECREATION_FEE_CODE", nullable = false)
  private String recreationFeeCode;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getForestFile() {
    return forestFile;
  }

  public void setForestFile(String forestFile) {
    this.forestFile = forestFile;
  }

  public BigDecimal getFeeAmount() {
    return feeAmount;
  }

  public void setFeeAmount(BigDecimal feeAmount) {
    this.feeAmount = feeAmount;
  }

  public LocalDate getFeeStartDate() {
    return feeStartDate;
  }

  public void setFeeStartDate(LocalDate feeStartDate) {
    this.feeStartDate = feeStartDate;
  }

  public LocalDate getFeeEndDate() {
    return feeEndDate;
  }

  public void setFeeEndDate(LocalDate feeEndDate) {
    this.feeEndDate = feeEndDate;
  }

  public String getMondayInd() {
    return mondayInd;
  }

  public void setMondayInd(String mondayInd) {
    this.mondayInd = mondayInd;
  }

  public String getTuesdayInd() {
    return tuesdayInd;
  }

  public void setTuesdayInd(String tuesdayInd) {
    this.tuesdayInd = tuesdayInd;
  }

  public String getWednesdayInd() {
    return wednesdayInd;
  }

  public void setWednesdayInd(String wednesdayInd) {
    this.wednesdayInd = wednesdayInd;
  }

  public String getThursdayInd() {
    return thursdayInd;
  }

  public void setThursdayInd(String thursdayInd) {
    this.thursdayInd = thursdayInd;
  }

  public String getFridayInd() {
    return fridayInd;
  }

  public void setFridayInd(String fridayInd) {
    this.fridayInd = fridayInd;
  }

  public String getSaturdayInd() {
    return saturdayInd;
  }

  public void setSaturdayInd(String saturdayInd) {
    this.saturdayInd = saturdayInd;
  }

  public String getSundayInd() {
    return sundayInd;
  }

  public void setSundayInd(String sundayInd) {
    this.sundayInd = sundayInd;
  }

  public String getRecreationFeeCode() {
    return recreationFeeCode;
  }

  public void setRecreationFeeCode(String recreationFeeCode) {
    this.recreationFeeCode = recreationFeeCode;
  }

  public Integer getRevisionCount() {
    return revisionCount;
  }

  public void setRevisionCount(Integer revisionCount) {
    this.revisionCount = revisionCount;
  }

  public String getEntryUserid() {
    return entryUserid;
  }

  public void setEntryUserid(String entryUserid) {
    this.entryUserid = entryUserid;
  }

  public LocalDateTime getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }

  public LocalDateTime getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }
}
