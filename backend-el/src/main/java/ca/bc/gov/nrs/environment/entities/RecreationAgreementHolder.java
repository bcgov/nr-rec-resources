package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_AGREEMENT_HOLDER", schema = "THE")
public class RecreationAgreementHolder {
  @Id
  @Column(name = "AGREEMENT_HOLDER_ID", nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "FOREST_FILE_ID", nullable = false)
  private RecreationProject forestFile;

  @Column(name = "AGREEMENT_START_DATE", nullable = false)
  private LocalDate agreementStartDate;

  @Column(name = "AGREEMENT_END_DATE", nullable = false)
  private LocalDate agreementEndDate;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDate entryTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDate updateTimestamp;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public RecreationProject getForestFile() {
    return forestFile;
  }

  public void setForestFile(RecreationProject forestFile) {
    this.forestFile = forestFile;
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

  public LocalDate getEntryTimestamp() {
    return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDate entryTimestamp) {
    this.entryTimestamp = entryTimestamp;
  }

  public String getUpdateUserid() {
    return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
    this.updateUserid = updateUserid;
  }

  public LocalDate getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDate updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }

}
