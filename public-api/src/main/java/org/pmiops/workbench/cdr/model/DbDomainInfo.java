package org.pmiops.workbench.cdr.model;

import java.util.Objects;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.model.Domain;

@Entity
@Table(name = "domain_info")
public class DbDomainInfo implements Comparable<DbDomainInfo> {

  private long conceptId;
  private Short domain;
  private String domainId;
  private String name;
  private String description;
  private long allConceptCount;
  private long standardConceptCount;
  private long participantCount;

  public DbDomainInfo() {
  }

  // Used from JQL queries in DomainInfoDao
  public DbDomainInfo(Short domain, String domainId, String name, String description,
      long conceptId, long allConceptCount, long standardConceptCount, long participantCount) {
    this.conceptId = conceptId;
    this.domain = domain;
    this.domainId = domainId;
    this.name = name;
    this.description = description;
    this.allConceptCount = allConceptCount;
    this.standardConceptCount = standardConceptCount;
    this.participantCount = participantCount;
  }

  @Column(name = "concept_id")
  public Long getConceptId() {
    return conceptId;
  }

  public void setConceptId(Long conceptId) {
    this.conceptId = conceptId;
  }

  public DbDomainInfo conceptId(Long conceptId) {
    this.conceptId = conceptId;
    return this;
  }

  @Column(name = "domain")
  public Short getDomain() {
    return domain;
  }

  public void setDomain(Short domain) {
    this.domain = domain;
  }

  public DbDomainInfo domain(Short domain) {
    this.domain = domain;
    return this;
  }

  @Transient
  public Domain getDomainEnum() {
    return CommonStorageEnums.domainFromStorage(domain);
  }

  public DbDomainInfo domainEnum(Domain domain) {
    this.domain = CommonStorageEnums.domainToStorage(domain);
    return this;
  }

  @Id
  @Column(name = "domain_id")
  public String getDomainId() {
    return domainId;
  }

  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

  public DbDomainInfo domainId(String domainId) {
    this.domainId = domainId;
    return this;
  }

  @Column(name = "name")
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public DbDomainInfo name(String name) {
    this.name = name;
    return this;
  }

  @Column(name = "description")
  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public DbDomainInfo description(String description) {
    this.description = description;
    return this;
  }

  @Column(name="all_concept_count")
  public long getAllConceptCount() {
    return allConceptCount;
  }

  public void setAllConceptCount(Long allConceptCount) {
    this.allConceptCount = allConceptCount == null ? 0L : allConceptCount;
  }

  public DbDomainInfo allConceptCount(long allConceptCount) {
    this.allConceptCount = allConceptCount;
    return this;
  }

  @Column(name="standard_concept_count")
  public long getStandardConceptCount() {
    return standardConceptCount;
  }

  public void setStandardConceptCount(Long standardConceptCount) {
    this.standardConceptCount = standardConceptCount == null ? 0L : standardConceptCount;
  }

  public DbDomainInfo standardConceptCount(long standardConceptCount) {
    this.standardConceptCount = standardConceptCount;
    return this;
  }

  @Column(name="participant_count")
  public long getParticipantCount(){
    return participantCount;
  }

  public void setParticipantCount(Long participantCount){
    this.participantCount = participantCount == null ? 0L : participantCount;
  }

  public DbDomainInfo participantCount(long participantCount){
    this.participantCount = participantCount;
    return this;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    DbDomainInfo domainInfo = (DbDomainInfo) o;
    return Objects.equals(domain, domainInfo.domain) &&
        Objects.equals(name, domainInfo.name) &&
        Objects.equals(description, domainInfo.description) &&
        Objects.equals(conceptId, domainInfo.conceptId) &&
        Objects.equals(allConceptCount, domainInfo.allConceptCount) &&
        Objects.equals(standardConceptCount, domainInfo.standardConceptCount) &&
        Objects.equals(participantCount, domainInfo.participantCount);
  }

  @Override
  public int hashCode() {
    return Objects.hash(domain, name, description, conceptId, allConceptCount, standardConceptCount, participantCount);
  }

  @Override
  public String toString() {
    return  ToStringBuilder.reflectionToString(this);
  }

  @Override
  public int compareTo(DbDomainInfo o) {
    return this.getDomain().compareTo(o.getDomain());
  }
}
