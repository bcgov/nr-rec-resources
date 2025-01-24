package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_INSPECTION_REPORT", schema = "THE")
public class RecreationInspectionReport {
  @Id
  @Column(name = "INSPECTION_ID", nullable = false)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "FOREST_FILE_ID", nullable = false)
  private RecreationProject forestFile;

  @Column(name = "SITE_NAME", nullable = false, length = 50)
  private String siteName;

  @Column(name = "LOCATION", length = 100)
  private String location;

  @Column(name = "INSPECTED_BY", length = 30)
  private String inspectedBy;

  @Column(name = "CAMPSITE_NO")
  private Short campsiteNo;

  @Column(name = "OCCUPIED_CAMPSITE_NO")
  private Short occupiedCampsiteNo;

  @Column(name = "VEHICLE_NO")
  private Short vehicleNo;

  @Column(name = "CAMPING_PARTY_NO")
  private Short campingPartyNo;

  @Column(name = "DAY_USE_PARTY_NO")
  private Short dayUsePartyNo;

  @Column(name = "WITH_PASS_NO")
  private Short withPassNo;

  @Column(name = "WITHOUT_PASS_NO")
  private Short withoutPassNo;

  @Column(name = "ABSENT_OWNER_NO")
  private Short absentOwnerNo;

  @Column(name = "TOTAL_INSPECTED_NO")
  private Short totalInspectedNo;

  @Column(name = "PURCHASED_PASS_NO")
  private Short purchasedPassNo;

  @Column(name = "REFUSED_PASS_NO")
  private Short refusedPassNo;

  @Column(name = "CONTRACT_ID", length = 20)
  private String contractId;

  @Column(name = "CONTRACTOR", length = 30)
  private String contractor;

  @Column(name = "REC_PROJECT_SKEY")
  private Long recProjectSkey;

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

  public RecreationProject getForestFile() {
    return forestFile;
  }

  public void setForestFile(RecreationProject forestFile) {
    this.forestFile = forestFile;
  }

  public String getSiteName() {
    return siteName;
  }

  public void setSiteName(String siteName) {
    this.siteName = siteName;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getInspectedBy() {
    return inspectedBy;
  }

  public void setInspectedBy(String inspectedBy) {
    this.inspectedBy = inspectedBy;
  }

  public Short getCampsiteNo() {
    return campsiteNo;
  }

  public void setCampsiteNo(Short campsiteNo) {
    this.campsiteNo = campsiteNo;
  }

  public Short getOccupiedCampsiteNo() {
    return occupiedCampsiteNo;
  }

  public void setOccupiedCampsiteNo(Short occupiedCampsiteNo) {
    this.occupiedCampsiteNo = occupiedCampsiteNo;
  }

  public Short getVehicleNo() {
    return vehicleNo;
  }

  public void setVehicleNo(Short vehicleNo) {
    this.vehicleNo = vehicleNo;
  }

  public Short getCampingPartyNo() {
    return campingPartyNo;
  }

  public void setCampingPartyNo(Short campingPartyNo) {
    this.campingPartyNo = campingPartyNo;
  }

  public Short getDayUsePartyNo() {
    return dayUsePartyNo;
  }

  public void setDayUsePartyNo(Short dayUsePartyNo) {
    this.dayUsePartyNo = dayUsePartyNo;
  }

  public Short getWithPassNo() {
    return withPassNo;
  }

  public void setWithPassNo(Short withPassNo) {
    this.withPassNo = withPassNo;
  }

  public Short getWithoutPassNo() {
    return withoutPassNo;
  }

  public void setWithoutPassNo(Short withoutPassNo) {
    this.withoutPassNo = withoutPassNo;
  }

  public Short getAbsentOwnerNo() {
    return absentOwnerNo;
  }

  public void setAbsentOwnerNo(Short absentOwnerNo) {
    this.absentOwnerNo = absentOwnerNo;
  }

  public Short getTotalInspectedNo() {
    return totalInspectedNo;
  }

  public void setTotalInspectedNo(Short totalInspectedNo) {
    this.totalInspectedNo = totalInspectedNo;
  }

  public Short getPurchasedPassNo() {
    return purchasedPassNo;
  }

  public void setPurchasedPassNo(Short purchasedPassNo) {
    this.purchasedPassNo = purchasedPassNo;
  }

  public Short getRefusedPassNo() {
    return refusedPassNo;
  }

  public void setRefusedPassNo(Short refusedPassNo) {
    this.refusedPassNo = refusedPassNo;
  }

  public String getContractId() {
    return contractId;
  }

  public void setContractId(String contractId) {
    this.contractId = contractId;
  }

  public String getContractor() {
    return contractor;
  }

  public void setContractor(String contractor) {
    this.contractor = contractor;
  }

  public Long getRecProjectSkey() {
    return recProjectSkey;
  }

  public void setRecProjectSkey(Long recProjectSkey) {
    this.recProjectSkey = recProjectSkey;
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
