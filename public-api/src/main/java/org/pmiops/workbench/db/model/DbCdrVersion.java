package org.pmiops.workbench.db.model;

import java.sql.Timestamp;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import org.apache.commons.lang3.builder.EqualsBuilder;

@Entity
@Table(name = "cdr_version")
public class DbCdrVersion {

  private long cdrVersionId;
  private boolean isDefault;
  private String name;
  private Timestamp creationTime;
  private int numParticipants;
  private String publicDbName;
  private String bigqueryProject;
  private String bigqueryDataset;
  private String genomicsProject;
  private String genomicsDataset;

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
            creationTime, numParticipants, publicDbName, bigqueryProject, bigqueryDataset);
  }

  @Column(name = "bigquery_project")
  public String getBigqueryProject() {
    return bigqueryProject;
  }

  public void setBigqueryProject(String bigqueryProject) {
    this.bigqueryProject = bigqueryProject;
  }

  @Column(name = "genomics_project")
  public String getGenomicsProject() {
    return genomicsProject;
  }

  public void setGenomicsProject(String genomicsProject) {
    this.genomicsProject = genomicsProject;
  }

  @Column(name = "bigquery_dataset")
  public String getBigqueryDataset() {
    return bigqueryDataset;
  }

  public void setBigqueryDataset(String bigqueryDataset) {
    this.bigqueryDataset = bigqueryDataset;
  }

  @Column(name = "genomics_dataset")
  public String getGenomicsDataset() {
    return genomicsDataset;
  }

  public void setGenomicsDataset(String genomicsDataset) {
    this.genomicsDataset = genomicsDataset;
  }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof DbCdrVersion)) {
      return false;
    }
    DbCdrVersion that = (DbCdrVersion) obj;
    return new EqualsBuilder().append(this.cdrVersionId, that.cdrVersionId)
            .append(this.isDefault, that.isDefault)
            .append(this.name, that.name)
            .append(this.creationTime, that.creationTime)
            .append(this.numParticipants, that.numParticipants)
            .append(this.publicDbName, that.publicDbName)
            .append(this.bigqueryProject, that.bigqueryProject)
            .append(this.bigqueryDataset, that.bigqueryDataset)
            .append(this.genomicsProject, that.genomicsProject)
            .append(this.genomicsDataset, that.genomicsDataset)
            .build();
  }
}