package org.pmiops.workbench.cdr.model;

import java.io.Serializable;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;
import java.util.Objects;

import org.apache.commons.lang3.builder.ToStringBuilder;

@Embeddable
public class DbSurveyMetadataId implements Serializable{

    @Column(name = "concept_id")
    private long conceptId;

    @Column(name = "survey_concept_id")
    private long surveyConceptId;

    @Column(name = "path")
    private String path;


    public DbSurveyMetadataId() {
    }

    public DbSurveyMetadataId(long conceptId, long surveyConceptId, String path) {
        this.conceptId = conceptId;
        this.surveyConceptId = surveyConceptId;
        this.path = path;
    }

    public long getConceptId() {
        return conceptId;
    }

    public void setConceptId(long conceptId) {
        this.conceptId = conceptId;
    }

    public DbSurveyMetadataId conceptId(long conceptId) {
        this.conceptId = conceptId;
        return this;
    }

    public long getSurveyConceptId() {
        return surveyConceptId;
    }

    public void setSurveyConceptId(long surveyConceptId) {
        this.surveyConceptId = surveyConceptId;
    }

    public DbSurveyMetadataId surveyConceptId(long surveyConceptId) {
        this.surveyConceptId = surveyConceptId;
        return this;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public DbSurveyMetadataId path(String path) {
        this.path = path;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DbSurveyMetadataId that = (DbSurveyMetadataId) o;
        return conceptId == that.conceptId &&
                surveyConceptId == that.surveyConceptId &&
                path == that.path;
    }

    @Override
    public int hashCode() {
        return Objects.hash(conceptId, surveyConceptId, path);
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("conceptId", conceptId)
                .append("surveyConceptId", surveyConceptId)
                .append("path", path)
                .toString();
    }

}