package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_AGREEMENT_HOLDER", schema = "THE")
@Immutable
public class RecreationAgreementHolder {
  @Id
  @Column(name = "AGREEMENT_HOLDER_ID", nullable = false)
  private Long id;

  @Column(name = "FOREST_FILE_ID", nullable = false)
  private String forestFile;

  @Column(name = "CLIENT_NUMBER", nullable = false)
  private String clientNumber;

  @Column(name = "CLIENT_LOCN_CODE", nullable = false)
  private String clientLocationCode;

  @Column(name = "AGREEMENT_START_DATE", nullable = false)
  private LocalDate agreementStartDate;

  @Column(name = "AGREEMENT_END_DATE", nullable = false)
  private LocalDate agreementEndDate;

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

  public LocalDateTime getEntryTimestamp() {
    return entryTimestamp;
  }

  public LocalDateTime getUpdateTimestamp() {
    return updateTimestamp;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getForestFile() {
    return forestFile;
  }

  public String getClientNumber() {
    return clientNumber;
  }

  public void setClientNumber(String clientNumber) {
    this.clientNumber = clientNumber;
  }

  public String getClientLocationCode() {
    return clientLocationCode;
  }

  public void setClientLocationCode(String clientLocationCode) {
    this.clientLocationCode = clientLocationCode;
  }

  public void setForestFile(String forestFile) {
    this.forestFile = forestFile;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

  public LocalDate getAgreementStartDate() {
    return agreementStartDate;
  }

  public void setAgreementStartDate(LocalDate agreementStartDate) {
    this.agreementStartDate = agreementStartDate;
  }

  public LocalDate getAgreementEndDate() {
    return agreementEndDate;
  }

  public void setAgreementEndDate(LocalDate agreementEndDate) {
    this.agreementEndDate = agreementEndDate;
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


  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }


}
