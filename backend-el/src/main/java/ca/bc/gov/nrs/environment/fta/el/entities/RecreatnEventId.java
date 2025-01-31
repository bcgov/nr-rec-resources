package ca.bc.gov.nrs.environment.fta.el.entities;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import org.hibernate.Hibernate;

public class RecreatnEventId implements Serializable {
  @Serial
  private static final long serialVersionUID = -5899159695350565436L;
  private Long orgUnitNo;

  private String forestFileId;

  private String recProjectId;

  private String eventTypeCode;

  private LocalDateTime entryTimestamp;

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

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    RecreatnEventId entity = (RecreatnEventId) o;
    return Objects.equals(this.entryTimestamp, entity.entryTimestamp) &&
      Objects.equals(this.eventTypeCode, entity.eventTypeCode) &&
      Objects.equals(this.orgUnitNo, entity.orgUnitNo) &&
      Objects.equals(this.forestFileId, entity.forestFileId) &&
      Objects.equals(this.recProjectId, entity.recProjectId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(entryTimestamp, eventTypeCode, orgUnitNo, forestFileId, recProjectId);
  }

}
