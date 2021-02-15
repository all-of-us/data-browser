package org.pmiops.workbench.cdr.model;

import com.google.common.base.Strings;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.OneToOne;
import javax.persistence.JoinColumn;
import javax.persistence.CascadeType;
import org.apache.commons.lang3.builder.ToStringBuilder;
import javax.persistence.FetchType;


@Entity
@Table(name = "measurement_concept_info")
public class DbMeasurementConceptInfo {
    private Long conceptId;
    private int hasValues;

    @OneToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="concept_id")
    private DbConcept dbConcept;

    public DbMeasurementConceptInfo() {}

    public DbMeasurementConceptInfo(DbMeasurementConceptInfo m) {
        this.conceptId(m.getConceptId())
                .hasValues(m.getHasValues());
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DbMeasurementConceptInfo that = (DbMeasurementConceptInfo) o;
        return Objects.equals(conceptId, that.conceptId) &&
                Objects.equals(hasValues, that.hasValues);
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
