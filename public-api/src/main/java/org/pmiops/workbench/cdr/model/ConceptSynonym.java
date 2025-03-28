package org.pmiops.workbench.cdr.model;

import org.apache.commons.lang3.builder.ToStringBuilder;

import jakarta.persistence.*;
import java.util.Objects;


@Entity
// NOTE: This class and ConceptSynonymDao exist only to make CriteriaDao work in tests;
// if we stop using concept_synonym there at some point we can get rid of them.
@Table(name = "concept_synonym")
public class ConceptSynonym {

    private long id;
    private long conceptId;
    private DbConcept dbConcept;
    private String conceptSynonymName;

    @Id
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public ConceptSynonym id(Long val) {
        this.id = val;
        return this;
    }

    @Column(name = "concept_id")
    public long getConceptId() {
        return conceptId;
    }

    public void setConceptId(long conceptId) {
        this.conceptId = conceptId;
    }

    public ConceptSynonym conceptId(long conceptId) {
        this.conceptId = conceptId;
        return this;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="concept_id", insertable=false, updatable=false)
    public DbConcept getDbConcept() {
        return dbConcept;
    }
    public void setDbConcept(DbConcept dbConcept) {
        this.dbConcept = dbConcept;
    }
    public ConceptSynonym conceptSynonym(DbConcept dbConcept) {
        this.dbConcept = dbConcept;
        return this;
    }

    @Column(name = "concept_synonym_name")
    public String getConceptSynonymName() {
        return conceptSynonymName;
    }

    public void setConceptSynonymName(String conceptSynonymName) {
        this.conceptSynonymName = conceptSynonymName;
    }

    public ConceptSynonym conceptSynonymName(String conceptSynonymName) {
        this.conceptSynonymName = conceptSynonymName;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConceptSynonym conceptSynonym = (ConceptSynonym) o;
        return conceptId == conceptSynonym.conceptId &&
                Objects.equals(conceptSynonymName, conceptSynonym.conceptSynonymName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(conceptId, dbConcept, conceptSynonymName);
    }

    @Override
    public String toString() {
        return  ToStringBuilder.reflectionToString(this);

    }
}
