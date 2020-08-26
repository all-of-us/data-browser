package org.pmiops.workbench.cdr.model;

import javax.persistence.*;
import java.util.Objects;
import java.util.List;

@Entity
//TODO need to add a way to dynamically switch between database versions
//this dynamic connection will eliminate the need for the catalog attribute
@Table(name = "achilles_results")
public class SurveyQuestionResult {

    private Long id;
    private Long analysisId;
    private String stratum1;
    private String stratum2;
    private String stratum3;
    private String stratum4;
    private String stratum5;
    private String stratum6;
    private Long countValue;
    private Long sourceCountValue;
    private String analysisStratumName;
    private List<QuestionConcept> subQuestions;
    private QuestionConcept question;

    public SurveyQuestionResult() {}

    public SurveyQuestionResult(Long analysisId, String stratum1, String stratum2, String stratum3, String stratum4, String stratum5, String stratum6, Long countValue, Long sourceCountValue) {
            this.analysisId = analysisId;
            this.stratum1 = stratum1;
            this.stratum2 = stratum2;
            this.stratum3 = stratum3;
            this.stratum4 = stratum4;
            this.stratum5 = stratum5;
            this.stratum6 = stratum6;
            this.countValue = countValue;
            this.sourceCountValue = sourceCountValue;
    }

    @Id
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public SurveyQuestionResult id(Long val) {
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
    public SurveyQuestionResult analysisId(Long val) {
        this.analysisId = val;
        return this;
    }

    @Column(name="stratum_1")
    public String getStratum1() {
        return stratum1;
    }
    public void setStratum1(String stratum1) {
        this.stratum1 = stratum1;
    }
    public SurveyQuestionResult stratum1(String val) {
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
    public SurveyQuestionResult stratum2(String val) {
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
    public SurveyQuestionResult stratum3(String val) {
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
    public SurveyQuestionResult stratum4(String val) {
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
    public SurveyQuestionResult stratum5(String val) {
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
    public SurveyQuestionResult stratum6(String val) {
        this.stratum6 = val;
        return this;
    }

    @Transient
    public String getAnalysisStratumName() {
        return analysisStratumName;
    }
    public void setAnalysisStratumName(String analysisStratumName) {
        this.analysisStratumName = analysisStratumName;
    }
    public SurveyQuestionResult analysisStratumName(String val) {
        this.analysisStratumName = val;
        return this;
    }

    @Transient
    public List<QuestionConcept> getSubQuestions() {
        return subQuestions;
    }
    public void setSubQuestions(List<QuestionConcept> subQuestions) {
        this.subQuestions = subQuestions;
    }
    public SurveyQuestionResult subQuestions(List<QuestionConcept> subQuestions) {
        this.subQuestions = subQuestions;
        return this;
    }

    @Column(name="count_value")
    public Long getCountValue() {
        return countValue;
    }
    public void setCountValue(Long countValue) {
        this.countValue = countValue;
    }
    public SurveyQuestionResult countValue(Long val) {
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
    public SurveyQuestionResult sourceCountValue(Long val) {
        this.sourceCountValue = val;
        return this;
    }

    @Override
    public String toString() {
        return "SurveyQuestionResult{" +
                "id=" + id +
                ", analysisId=" + analysisId +
                ", stratum1='" + stratum1 + '\'' +
                ", stratum2='" + stratum2 + '\'' +
                ", stratum3='" + stratum3 + '\'' +
                ", stratum4='" + stratum4 + '\'' +
                ", stratum5='" + stratum5 + '\'' +
                ", stratum6='" + stratum6 + '\'' +
                ", countValue=" + countValue +
                ", sourceCountValue=" + sourceCountValue +
                ", analysisStratumName='" + analysisStratumName + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SurveyQuestionResult that = (SurveyQuestionResult) o;
        return analysisId == that.analysisId &&
                Objects.equals(stratum1, that.stratum1) &&
                Objects.equals(stratum2, that.stratum2) &&
                Objects.equals(stratum3, that.stratum3) &&
                Objects.equals(stratum4, that.stratum4) &&
                Objects.equals(stratum5, that.stratum5) &&
                Objects.equals(stratum6, that.stratum6) &&
                Objects.equals(countValue, that.countValue);
    }

    @Override
    public int hashCode() {
        return Objects.hash(analysisId, stratum1, stratum2, stratum3, stratum4, stratum5, stratum6, countValue, sourceCountValue);
    }
}
