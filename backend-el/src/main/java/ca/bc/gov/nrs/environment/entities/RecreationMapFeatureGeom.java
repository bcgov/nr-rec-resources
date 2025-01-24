package ca.bc.gov.nrs.environment.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.locationtech.jts.geom.Geometry;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "RECREATION_MAP_FEATURE_GEOM", schema = "THE")
public class RecreationMapFeatureGeom extends PanacheEntityBase {
  @Id
  @Column(name = "RMF_SKEY", nullable = false)
  private Long id;

  @MapsId
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "RMF_SKEY", nullable = false)
  private RecreationMapFeature recreationMapFeature;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "MAP_FEATURE_ID", nullable = false)
  private TenureApplicationMapFeature mapFeature;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @OnDelete(action = OnDeleteAction.RESTRICT)
  @JoinColumn(name = "GEOMETRY_TYPE_CODE", nullable = false)
  private GeometryTypeCode geometryTypeCode;

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
  private LocalDate entryTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;
  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDate updateTimestamp;

  public Geometry getGeometry() {
    return geometry;
  }

  public void setGeometry(Geometry geometry) {
    this.geometry = geometry;
  }

  @Column(name = "GEOMETRY", columnDefinition = "SDO_GEOMETRY")
  private Geometry geometry;


  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public RecreationMapFeature getRecreationMapFeature() {
    return recreationMapFeature;
  }

  public void setRecreationMapFeature(RecreationMapFeature recreationMapFeature) {
    this.recreationMapFeature = recreationMapFeature;
  }

  public TenureApplicationMapFeature getMapFeature() {
    return mapFeature;
  }

  public void setMapFeature(TenureApplicationMapFeature mapFeature) {
    this.mapFeature = mapFeature;
  }

  public GeometryTypeCode getGeometryTypeCode() {
    return geometryTypeCode;
  }

  public void setGeometryTypeCode(GeometryTypeCode geometryTypeCode) {
    this.geometryTypeCode = geometryTypeCode;
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
