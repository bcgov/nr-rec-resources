package ca.bc.gov.nrs.environment.fta.el.entities;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_SEARCH_RESULT", schema = "THE")
@Immutable
public class RecreationSearchResult {
  @Id
  @Column(name = "FOREST_FILE_ID", length = 10)
  private String forestFileId;

  @Column(name = "ORG_UNIT_CODE", length = 6)
  private String orgUnitCode;

  @Column(name = "ORG_UNIT_NAME", length = 100)
  private String orgUnitName;

  @Column(name = "FILE_STATUS_CODE", length = 3)
  private String fileStatusCode;

  @Column(name = "PROJECT_NAME", length = 100)
  private String projectName;

  @Column(name = "PROJECT_TYPE", length = 240)
  private String projectType;

  @Column(name = "RECREATION_PROJECT_CODE", length = 3)
  private String recreationProjectCode;

  @Column(name = "RECREATION_PROJECT_CODE_DESC", length = 120)
  private String recreationProjectCodeDesc;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
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

  public String getFileStatusCode() {
    return fileStatusCode;
  }

  public void setFileStatusCode(String fileStatusCode) {
    this.fileStatusCode = fileStatusCode;
  }

  public String getProjectName() {
    return projectName;
  }

  public void setProjectName(String projectName) {
    this.projectName = projectName;
  }

  public String getProjectType() {
    return projectType;
  }

  public void setProjectType(String projectType) {
    this.projectType = projectType;
  }

  public String getRecreationProjectCode() {
    return recreationProjectCode;
  }

  public void setRecreationProjectCode(String recreationProjectCode) {
    this.recreationProjectCode = recreationProjectCode;
  }

  public String getRecreationProjectCodeDesc() {
    return recreationProjectCodeDesc;
  }

  public void setRecreationProjectCodeDesc(String recreationProjectCodeDesc) {
    this.recreationProjectCodeDesc = recreationProjectCodeDesc;
  }

}
