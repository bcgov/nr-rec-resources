package ca.bc.gov.nrs.environment.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RECREATION_SITE", schema = "THE")
public class RecreationSite {
  @Id
  @Column(name = "FOREST_FILE_ID", nullable = false, length = 10)
  private String forestFileId;

  @Column(name = "REC_SITE_NAME", length = 50)
  private String recSiteName;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getRecSiteName() {
    return recSiteName;
  }

  public void setRecSiteName(String recSiteName) {
    this.recSiteName = recSiteName;
  }

}
