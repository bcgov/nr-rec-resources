package ca.bc.gov.nrs.environment.fta.el.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.Immutable;

@Entity
@Table(name = "RECREATION_MAP_FEATURE_XGUID", schema = "THE")
@Immutable
public class RecreationMapFeatureXguid {
  @Id
  @Column(name = "RMF_GUID", nullable = false)
  private byte[] id;

  @Column(name = "RMF_SKEY")
  private Long rmfSkey;

  public byte[] getId() {
    return id;
  }

  public void setId(byte[] id) {
    this.id = id;
  }

  public Long getRmfSkey() {
    return rmfSkey;
  }

  public void setRmfSkey(Long rmfSkey) {
    this.rmfSkey = rmfSkey;
  }

}
