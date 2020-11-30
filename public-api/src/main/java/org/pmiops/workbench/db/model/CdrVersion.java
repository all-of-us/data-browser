package org.pmiops.workbench.db.model;

import java.sql.Timestamp;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import org.apache.commons.lang3.builder.EqualsBuilder;

@Entity
@Table(name = "cdr_version")
public class CdrVersion {

  private long cdrVersionId;
  private boolean isDefault;
  private String name;
  private Timestamp creationTime;
  private int numParticipants;
  private String publicDbName;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "cdr_version_id")
  public long getCdrVersionId() {
    return cdrVersionId;
  }

  public void setCdrVersionId(long cdrVersionId) {
    this.cdrVersionId = cdrVersionId;
  }

  @Column(name = "is_default")
  public boolean getIsDefault() {
    return isDefault;
  }

  public void setIsDefault(boolean isDefault) {
    this.isDefault = isDefault;
  }

  @Column(name = "name")
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  @Column(name = "creation_time")
  public Timestamp getCreationTime() {
    return creationTime;
  }

  public void setCreationTime(Timestamp creationTime) {
    this.creationTime = creationTime;
  }

  @Column(name = "num_participants")
  public int getNumParticipants() {
    return numParticipants;
  }

  public void setNumParticipants(int numParticipants) {
    this.numParticipants = numParticipants;
  }

  @Column(name = "public_db_name")
  public String getPublicDbName() { return publicDbName; }

  public void setPublicDbName(String publicDbName) { this.publicDbName = publicDbName; }

  @Override
  public int hashCode() {
    return Objects.hash(cdrVersionId, isDefault, name,
          creationTime, numParticipants, publicDbName);
  }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof CdrVersion)) {
      return false;
    }
    CdrVersion that = (CdrVersion) obj;
    return new EqualsBuilder().append(this.cdrVersionId, that.cdrVersionId)
        .append(this.isDefault, that.isDefault)
        .append(this.name, that.name)
        .append(this.creationTime, that.creationTime)
        .append(this.numParticipants, that.numParticipants)
        .append(this.publicDbName, that.publicDbName)
        .build();
  }
}
