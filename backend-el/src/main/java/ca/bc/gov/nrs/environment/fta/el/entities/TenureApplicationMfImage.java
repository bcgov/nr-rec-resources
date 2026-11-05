package ca.bc.gov.nrs.environment.fta.el.entities;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "TENURE_APPLICATION_MF_IMAGE", schema = "THE")
@Immutable
public class TenureApplicationMfImage {

  @Id
  @Column(name = "MAP_FEATURE_ID", nullable = false)
  private Long mapFeatureId;

  @Lob
  @Column(name = "EXHIBIT_A_IMAGE", nullable = false)
  private byte[] exhibitAImage;

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

  public Long getMapFeatureId() {
	return mapFeatureId;
  }

  public void setMapFeatureId(Long mapFeatureId) {
	this.mapFeatureId = mapFeatureId;
  }

  public byte[] getExhibitAImage() {
	return exhibitAImage;
  }

  public void setExhibitAImage(byte[] exhibitAImage) {
	this.exhibitAImage = exhibitAImage;
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

  public LocalDateTime getEntryTimestamp() {
	return entryTimestamp;
  }

  public void setEntryTimestamp(LocalDateTime entryTimestamp) {
	this.entryTimestamp = entryTimestamp;
  }

  public String getUpdateUserid() {
	return updateUserid;
  }

  public void setUpdateUserid(String updateUserid) {
	this.updateUserid = updateUserid;
  }

  public LocalDateTime getUpdateTimestamp() {
	return updateTimestamp;
  }

  public void setUpdateTimestamp(LocalDateTime updateTimestamp) {
	this.updateTimestamp = updateTimestamp;
  }
}
