package ca.bc.gov.nrs.environment.fta.el.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.locationtech.jts.geom.Geometry;
import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Immutable
@Table(name = "RECREATION_MAP_FEATURE_GEOM", schema = "THE")
public class RecreationMapFeatureGeom {
  @Id
  @Column(name = "RMF_SKEY", nullable = false)
  private Long id;

  @Column(name = "MAP_FEATURE_ID", nullable = false)
  private Long mapFeatureId;

  @Column(name = "GEOMETRY_TYPE_CODE", nullable = false)
  private String geometryTypeCode;

  @Column(name = "GEOMETRY", columnDefinition = "SDO_GEOMETRY")
  private Geometry geometry;

  @Column(name = "FEATURE_AREA", nullable = false, precision = 11, scale = 4)
  private BigDecimal featureArea;

  @Column(name = "FEATURE_LENGTH", nullable = false, precision = 11, scale = 4)
  private BigDecimal featureLength;

  @Column(name = "FEATURE_PERIMETER", nullable = false, precision = 11, scale = 4)
  private BigDecimal featurePerimeter;

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


  public Geometry getGeometry() {
    return geometry;
  }

  public void setGeometry(Geometry geometry) {
    this.geometry = geometry;
  }




  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public BigDecimal getFeatureArea() {
    return featureArea;
  }

  public void setFeatureArea(BigDecimal featureArea) {
    this.featureArea = featureArea;
  }

  public BigDecimal getFeatureLength() {
    return featureLength;
  }

  public void setFeatureLength(BigDecimal featureLength) {
    this.featureLength = featureLength;
  }

  public BigDecimal getFeaturePerimeter() {
    return featurePerimeter;
  }

  public void setFeaturePerimeter(BigDecimal featurePerimeter) {
    this.featurePerimeter = featurePerimeter;
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

  public Long getMapFeatureId() {
    return mapFeatureId;
  }

  public void setMapFeatureId(Long mapFeatureId) {
    this.mapFeatureId = mapFeatureId;
  }

  public String getGeometryTypeCode() {
    return geometryTypeCode;
  }

  public void setGeometryTypeCode(String geometryTypeCode) {
    this.geometryTypeCode = geometryTypeCode;
  }


}
