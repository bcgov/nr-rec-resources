package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDate;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_RISK_SITE", schema = "THE")
@Immutable
public class RecreationRiskSite {
  @Id
  @Column(name = "RISK_SITE_ID", nullable = false)
  private Long id;

  @Column(name = "FOREST_FILE_ID", nullable = false)
  private String forestFile;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDate entryTimestamp;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

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

  public String getForestFile() {
    return forestFile;
  }

  public void setForestFile(String forestFile) {
    this.forestFile = forestFile;
  }

  public String getEntryUserid() {
    return entryUserid;
  }

  public void setEntryUserid(String entryUserid) {
    this.entryUserid = entryUserid;
  }

  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }

  public LocalDate getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDate entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public LocalDate getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDate updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }
}
