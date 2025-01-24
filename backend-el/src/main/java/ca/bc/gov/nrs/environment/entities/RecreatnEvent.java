package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATN_EVENT", schema = "THE")
public class RecreatnEvent {
  @Id
  @Column(name = "ORG_UNIT_NO", nullable = false)
  private Long orgUnitNo;

  @Column(name = "DISTRICT_ADMN_ZONE", nullable = false, length = 4)
  private String districtAdmnZone;

  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "REC_PROJECT_ID", nullable = false, length = 2)
  private String recProjectId;

  @Column(name = "EVENT_DUE_DATE", nullable = false)
  private LocalDate eventDueDate;

  @Column(name = "EVENT_DATE", nullable = false)
  private LocalDate eventDate;

  @Column(name = "EVENT_TYPE_CODE", nullable = false, length = 3)
  private String eventTypeCode;

  @Column(name = "EVENT_REMARKS", nullable = false, length = 254)
  private String eventRemarks;

  @Column(name = "WORK_ASSIGNMENT_CD", nullable = false, length = 3)
  private String workAssignmentCd;

  @Column(name = "COMPLETED_BY", nullable = false, length = 8)
  private String completedBy;

  @Column(name = "ENTERED_BY", nullable = false, length = 8)
  private String enteredBy;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDate entryTimestamp;

  public Long getOrgUnitNo() {
    return orgUnitNo;
  }

  public void setOrgUnitNo(Long orgUnitNo) {
    this.orgUnitNo = orgUnitNo;
  }

  public String getDistrictAdmnZone() {
    return districtAdmnZone;
  }

  public void setDistrictAdmnZone(String districtAdmnZone) {
    this.districtAdmnZone = districtAdmnZone;
  }

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getRecProjectId() {
    return recProjectId;
  }

  public void setRecProjectId(String recProjectId) {
    this.recProjectId = recProjectId;
  }

  public LocalDate getEventDueDate() {
    return eventDueDate;
  }

  public void setEventDueDate(LocalDate eventDueDate) {
    this.eventDueDate = eventDueDate;
  }

  public LocalDate getEventDate() {
    return eventDate;
  }

  public void setEventDate(LocalDate eventDate) {
    this.eventDate = eventDate;
  }

  public String getEventTypeCode() {
    return eventTypeCode;
  }

  public void setEventTypeCode(String eventTypeCode) {
    this.eventTypeCode = eventTypeCode;
  }

  public String getEventRemarks() {
    return eventRemarks;
  }

  public void setEventRemarks(String eventRemarks) {
    this.eventRemarks = eventRemarks;
  }

  public String getWorkAssignmentCd() {
    return workAssignmentCd;
  }

  public void setWorkAssignmentCd(String workAssignmentCd) {
    this.workAssignmentCd = workAssignmentCd;
  }

  public String getCompletedBy() {
    return completedBy;
  }

  public void setCompletedBy(String completedBy) {
    this.completedBy = completedBy;
  }

  public String getEnteredBy() {
    return enteredBy;
  }

  public void setEnteredBy(String enteredBy) {
    this.enteredBy = enteredBy;
  }

  public LocalDate getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDate entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

}
