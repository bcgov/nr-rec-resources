package ca.bc.gov.nrs.environment.fta.el.entities;

import java.time.LocalDate;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ORG_UNIT", schema = "THE")
@Immutable
public class OrgUnit {

  @Id
  @Column(name = "ORG_UNIT_NO", nullable = false, precision = 10)
  private Long orgUnitNo;

  @Column(name = "ORG_UNIT_CODE", nullable = false, length = 6)
  private String orgUnitCode;

  @Column(name = "ORG_UNIT_NAME", nullable = false, length = 100)
  private String orgUnitName;

  @Column(name = "LOCATION_CODE", nullable = false, length = 3)
  private String locationCode;

  @Column(name = "AREA_CODE", nullable = false, length = 3)
  private String areaCode;

  @Column(name = "TELEPHONE_NO", nullable = false, length = 7)
  private String telephoneNo;

  @Column(name = "ORG_LEVEL_CODE", nullable = false, length = 1)
  private String orgLevelCode;

  @Column(name = "OFFICE_NAME_CODE", nullable = false, length = 2)
  private String officeNameCode;

  @Column(name = "ROLLUP_REGION_NO", nullable = false, precision = 10)
  private Long rollupRegionNo;

  @Column(name = "ROLLUP_REGION_CODE", nullable = false, length = 6)
  private String rollupRegionCode;

  @Column(name = "ROLLUP_DIST_NO", nullable = false, precision = 10)
  private Long rollupDistNo;

  @Column(name = "ROLLUP_DIST_CODE", nullable = false, length = 6)
  private String rollupDistCode;

  @Column(name = "EFFECTIVE_DATE", nullable = false)
  private LocalDate effectiveDate;

  @Column(name = "EXPIRY_DATE", nullable = false)
  private LocalDate expiryDate;

  @Column(name = "UPDATE_TIMESTAMP")
  private LocalDate updateTimestamp;

  public Long getOrgUnitNo() {
    return orgUnitNo;
  }

  public void setOrgUnitNo(Long orgUnitNo) {
    this.orgUnitNo = orgUnitNo;
  }

  public String getOrgUnitCode() {
    return orgUnitCode;
  }

  public void setOrgUnitCode(String orgUnitCode) {
    this.orgUnitCode = orgUnitCode;
  }

  public String getOrgUnitName() {
    return orgUnitName;
  }

  public void setOrgUnitName(String orgUnitName) {
    this.orgUnitName = orgUnitName;
  }

  public String getLocationCode() {
    return locationCode;
  }

  public void setLocationCode(String locationCode) {
    this.locationCode = locationCode;
  }

  public String getAreaCode() {
    return areaCode;
  }

  public void setAreaCode(String areaCode) {
    this.areaCode = areaCode;
  }

  public String getTelephoneNo() {
    return telephoneNo;
  }

  public void setTelephoneNo(String telephoneNo) {
    this.telephoneNo = telephoneNo;
  }

  public String getOrgLevelCode() {
    return orgLevelCode;
  }

  public void setOrgLevelCode(String orgLevelCode) {
    this.orgLevelCode = orgLevelCode;
  }

  public String getOfficeNameCode() {
    return officeNameCode;
  }

  public void setOfficeNameCode(String officeNameCode) {
    this.officeNameCode = officeNameCode;
  }

  public Long getRollupRegionNo() {
    return rollupRegionNo;
  }

  public void setRollupRegionNo(Long rollupRegionNo) {
    this.rollupRegionNo = rollupRegionNo;
  }

  public String getRollupRegionCode() {
    return rollupRegionCode;
  }

  public void setRollupRegionCode(String rollupRegionCode) {
    this.rollupRegionCode = rollupRegionCode;
  }

  public Long getRollupDistNo() {
    return rollupDistNo;
  }

  public void setRollupDistNo(Long rollupDistNo) {
    this.rollupDistNo = rollupDistNo;
  }

  public String getRollupDistCode() {
    return rollupDistCode;
  }

  public void setRollupDistCode(String rollupDistCode) {
    this.rollupDistCode = rollupDistCode;
  }

  public LocalDate getEffectiveDate() {
    return effectiveDate;
  }

  public void setEffectiveDate(LocalDate effectiveDate) {
    this.effectiveDate = effectiveDate;
  }

  public LocalDate getExpiryDate() {
    return expiryDate;
  }

  public void setExpiryDate(LocalDate expiryDate) {
    this.expiryDate = expiryDate;
  }

  public LocalDate getUpdateTimestamp() {
    return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDate updateTimestamp) {
    this.updateTimestamp = updateTimestamp;
  }
}
