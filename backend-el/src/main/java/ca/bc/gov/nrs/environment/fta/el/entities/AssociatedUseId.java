package ca.bc.gov.nrs.environment.fta.el.entities;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

import org.hibernate.Hibernate;

public class AssociatedUseId implements Serializable {
  @Serial
  private static final long serialVersionUID = 4820398547193726104L;

  private String forestFileId;

  private String fileSourceCode;

  private String associatedFileId;

  public String getForestFileId() {
    return forestFileId;
  }

  public void setForestFileId(String forestFileId) {
    this.forestFileId = forestFileId;
  }

  public String getFileSourceCode() {
    return fileSourceCode;
  }

  public void setFileSourceCode(String fileSourceCode) {
    this.fileSourceCode = fileSourceCode;
  }

  public String getAssociatedFileId() {
    return associatedFileId;
  }

  public void setAssociatedFileId(String associatedFileId) {
    this.associatedFileId = associatedFileId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    AssociatedUseId entity = (AssociatedUseId) o;
    return Objects.equals(this.forestFileId, entity.forestFileId) &&
      Objects.equals(this.fileSourceCode, entity.fileSourceCode) &&
      Objects.equals(this.associatedFileId, entity.associatedFileId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(forestFileId, fileSourceCode, associatedFileId);
  }
}
