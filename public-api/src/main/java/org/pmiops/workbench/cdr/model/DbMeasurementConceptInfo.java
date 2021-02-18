package org.pmiops.workbench.cdr.model;

import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import org.apache.commons.lang3.builder.ToStringBuilder;

@Entity
@Table(name = "measurement_concept_info")
public class DbMeasurementConceptInfo {
    private Long conceptId;
    private int hasValues;
    private String measurementType;

    public DbMeasurementConceptInfo() {}

    public DbMeasurementConceptInfo(DbMeasurementConceptInfo m) {
        this.conceptId(m.getConceptId())
            .hasValues(m.getHasValues())
            .measurementType(m.getMeasurementType());
    }

    @Id
    @Column(name="concept_id")
    public Long getConceptId() {
        return conceptId;
    }
    public void setConceptId(Long conceptId) {
        this.conceptId = conceptId;
    }
    public DbMeasurementConceptInfo conceptId(Long cid) {
        this.conceptId = cid;
        return this;
    }

    @Column(name="has_values")
    public int getHasValues() {
        return hasValues;
    }
    public void setHasValues(int val) {
        this.hasValues = val;
    }
    public DbMeasurementConceptInfo hasValues(int val) {
        this.hasValues = val;
        return this;
    }

    @Column(name="measurement_type")
    public String getMeasurementType() {
        return measurementType;
    }
    public void setMeasurementType(String measurementType) {
        this.measurementType = measurementType;
    }
    public DbMeasurementConceptInfo measurementType(String measurementType) {
        this.measurementType = measurementType;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DbMeasurementConceptInfo that = (DbMeasurementConceptInfo) o;
        return Objects.equals(conceptId, that.conceptId) &&
                Objects.equals(hasValues, that.hasValues) &&
                Objects.equals(measurementType, that.measurementType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(conceptId, hasValues);
    }

    @Override
    public String toString() {
        return  ToStringBuilder.reflectionToString(this);
    }
}
