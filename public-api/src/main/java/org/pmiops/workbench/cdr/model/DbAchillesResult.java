package org.pmiops.workbench.cdr.model;

import java.util.Objects;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import jakarta.persistence.FetchType;

@Entity
@Table(name = "achilles_results")
public class DbAchillesResult  {

    private Long id;
    private Long analysisId;
    private DbAchillesAnalysis analysis;
    private String stratum1;
    private String stratum2;
    private String stratum3;
    private String stratum4;
    private String stratum5;
    private String stratum6;
    private String stratum7;
    private Long countValue;
    private Long sourceCountValue;
    private String analysisStratumName;
    private String measurementValueType;
    private int hasSubQuestions;

    @Id
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public DbAchillesResult id(Long val) {
        this.id = val;
        return this;
    }

    @Column(name="analysis_id")
    public Long getAnalysisId() {
        return analysisId;
    }
    public void setAnalysisId(Long analysisId) {
        this.analysisId = analysisId;
    }
    public DbAchillesResult analysisId(Long val) {
        this.analysisId = val;
        return this;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="analysis_id", insertable=false, updatable=false)
    public DbAchillesAnalysis getAnalysis() {
        return analysis;
    }
    public void setAnalysis(DbAchillesAnalysis analysis) {
        this.analysis = analysis;
    }
    public DbAchillesResult analysis(DbAchillesAnalysis analysis) {
        this.analysis = analysis;
        return this;
    }

    @Column(name="stratum_1")
    public String getStratum1() {
        return stratum1;
    }
    public void setStratum1(String stratum1) {
        this.stratum1 = stratum1;
    }
    public DbAchillesResult stratum1(String val) {
        this.stratum1 = val;
        return this;
    }

    @Column(name="stratum_2")
    public String getStratum2() {
        return stratum2;
    }
    public void setStratum2(String stratum2) {
        this.stratum2 = stratum2;
    }
    public DbAchillesResult stratum2(String val) {
        this.stratum2 = val;
        return this;
    }

    @Column(name="stratum_3")
    public String getStratum3() {
        return stratum3;
    }
    public void setStratum3(String stratum3) {
        this.stratum3 = stratum3;
    }
    public DbAchillesResult stratum3(String val) {
        this.stratum3 = val;
        return this;
    }

    @Column(name="stratum_4")
    public String getStratum4() {
        return stratum4;
    }
    public void setStratum4(String stratum4) {
        this.stratum4 = stratum4;
    }
    public DbAchillesResult stratum4(String val) {
        this.stratum4 = val;
        return this;
    }

    @Column(name="stratum_5")
    public String getStratum5() {
        return stratum5;
    }
    public void setStratum5(String stratum5) {
        this.stratum5 = stratum5;
    }
    public DbAchillesResult stratum5(String val) {
        this.stratum5 = val;
        return this;
    }

    @Column(name="stratum_6")
    public String getStratum6() {
        return stratum6;
    }
    public void setStratum6(String stratum6) {
        this.stratum6 = stratum6;
    }
    public DbAchillesResult stratum6(String val) {
        this.stratum6 = val;
        return this;
    }

    @Column(name="stratum_7")
    public String getStratum7() {
        return stratum7;
    }
    public void setStratum7(String stratum7) {
        this.stratum7 = stratum7;
    }
    public DbAchillesResult stratum7(String val) {
        this.stratum7 = val;
        return this;
    }

    @Transient
    public String getAnalysisStratumName() {
        return analysisStratumName;
    }
    public void setAnalysisStratumName(String analysisStratumName) {
        this.analysisStratumName = analysisStratumName;
    }
    public DbAchillesResult analysisStratumName(String val) {
        this.analysisStratumName = val;
        return this;
    }

    @Transient
    public String getMeasurementValueType() {
        return measurementValueType;
    }
    public void setMeasurementValueType(String measurementValueType) {
        this.measurementValueType = measurementValueType;
    }
    public DbAchillesResult measurementValueType(String val) {
        this.measurementValueType = val;
        return this;
    }

    @Transient
    public int getHasSubQuestions() {
        return hasSubQuestions;
    }
    public void setHasSubQuestions(int hasSubQuestions) {
        this.hasSubQuestions = hasSubQuestions;
    }
    public DbAchillesResult hasSubQuestions(int val) {
        this.hasSubQuestions = val;
        return this;
    }

    @Column(name="count_value")
    public Long getCountValue() {
        return countValue;
    }
    public void setCountValue(Long countValue) {
        this.countValue = countValue;
    }
    public DbAchillesResult countValue(Long val) {
        this.countValue = val;
        return this;
    }

    @Column(name="source_count_value")
    public Long getSourceCountValue() {
        return sourceCountValue;
    }
    public void setSourceCountValue(Long sourceCountValue) {
        this.sourceCountValue = sourceCountValue;
    }
    public DbAchillesResult sourceCountValue(Long val) {
        this.sourceCountValue = val;
        return this;
    }

    @Override
    public String toString() {
        return "DbAchillesResult{" +
                "id=" + id +
                ", analysisId=" + analysisId +
                ", analysis=" + analysis +
                ", stratum1='" + stratum1 + '\'' +
                ", stratum2='" + stratum2 + '\'' +
                ", stratum3='" + stratum3 + '\'' +
                ", stratum4='" + stratum4 + '\'' +
                ", stratum5='" + stratum5 + '\'' +
                ", stratum6='" + stratum6 + '\'' +
                ", stratum7='" + stratum7 + '\'' +
                ", countValue=" + countValue +
                ", sourceCountValue=" + sourceCountValue +
                ", analysisStratumName='" + analysisStratumName + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DbAchillesResult that = (DbAchillesResult) o;
        return analysisId == that.analysisId &&
                Objects.equals(stratum1, that.stratum1) &&
                Objects.equals(stratum2, that.stratum2) &&
                Objects.equals(stratum3, that.stratum3) &&
                Objects.equals(stratum4, that.stratum4) &&
                Objects.equals(stratum5, that.stratum5) &&
                Objects.equals(stratum6, that.stratum6) &&
                Objects.equals(stratum7, that.stratum7) &&
                Objects.equals(countValue, that.countValue);
    }

    @Override
    public int hashCode() {
        return Objects.hash(analysisId, analysis, stratum1, stratum2, stratum3, stratum4, stratum5, stratum6, stratum7, countValue, sourceCountValue);
    }
}
