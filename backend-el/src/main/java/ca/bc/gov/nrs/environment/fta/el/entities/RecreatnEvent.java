package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.*;
import org.springframework.data.annotation.Immutable;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECREATN_EVENT", schema = "THE")
@Immutable
@IdClass(RecreatnEventId.class)
public class RecreatnEvent {
  @Id
  @Column(name = "ORG_UNIT_NO", nullable = false)
  private Long orgUnitNo;

  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Id
  @Column(name = "REC_PROJECT_ID", nullable = false, length = 2)
  private String recProjectId;

  @Id
  @Column(name = "EVENT_TYPE_CODE", nullable = false, length = 3)
  private String eventTypeCode;

  @Id
  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "DISTRICT_ADMN_ZONE", nullable = false, length = 4)
  private String districtAdmnZone;

  @Column(name = "EVENT_DUE_DATE", nullable = false)
  private LocalDateTime eventDueDate;

  @Column(name = "EVENT_DATE", nullable = false)
  private LocalDateTime eventDate;

  @Column(name = "EVENT_REMARKS", nullable = false, length = 254)
  private String eventRemarks;

  @Column(name = "WORK_ASSIGNMENT_CD", nullable = false, length = 3)
  private String workAssignmentCd;

  @Column(name = "COMPLETED_BY", nullable = false, length = 8)
  private String completedBy;

  @Column(name = "ENTERED_BY", nullable = false, length = 8)
  private String enteredBy;

  public Long getOrgUnitNo() {
    return orgUnitNo;
  }

  public void setOrgUnitNo(Long orgUnitNo) {
    this.orgUnitNo = orgUnitNo;
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

  public String getEventTypeCode() {
    return eventTypeCode;
  }

  public void setEventTypeCode(String eventTypeCode) {
    this.eventTypeCode = eventTypeCode;
  }

  public LocalDateTime getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public String getDistrictAdmnZone() {
    return districtAdmnZone;
  }

  public void setDistrictAdmnZone(String districtAdmnZone) {
    this.districtAdmnZone = districtAdmnZone;
  }

  public LocalDateTime getEventDueDate() {
    return eventDueDate;
  }

  public void setEventDueDate(LocalDateTime eventDueDate) {
    this.eventDueDate = eventDueDate;
  }

  public LocalDateTime getEventDate() {
    return eventDate;
  }

  public void setEventDate(LocalDateTime eventDate) {
    this.eventDate = eventDate;
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
}
