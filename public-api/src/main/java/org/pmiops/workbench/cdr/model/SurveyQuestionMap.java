package org.pmiops.workbench.cdr.model;

import javax.persistence.*;
import java.util.Objects;

@Entity
//TODO need to add a way to dynamically switch between database versions
//this dynamic connection will eliminate the need for the catalog attribute
@Table(name = "survey_question_map")
public class SurveyQuestionMap  {

    private int id;
    private Long surveyConceptId;
    private Long questionConceptId;
    private int surveyOrderNumber;
    private int questionOrderNumber;
    private String path;
    private int sub;

    public SurveyQuestionMap() {}

    public SurveyQuestionMap(int id, long surveyConceptId, long questionConceptId, int surveyOrderNumber, int questionOrderNumber, String path, int sub, QuestionConcept concept) {
        this.id = id;
        this.surveyConceptId = surveyConceptId;
        this.questionConceptId = questionConceptId;
        this.surveyOrderNumber = surveyOrderNumber;
        this.questionOrderNumber = questionOrderNumber;
        this.path = path;
        this.sub = sub;
    }

    @Id
    @Column(name="id")
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public SurveyQuestionMap id(int val) {
        this.id = val;
        return this;
    }

    @Column(name="survey_concept_id")
    public Long getSurveyConceptId() {
        return surveyConceptId;
    }
    public void setSurveyConceptId(Long surveyConceptId) {
        this.surveyConceptId = surveyConceptId;
    }
    public SurveyQuestionMap surveyConceptId(Long val) {
        this.surveyConceptId = val;
        return this;
    }

    @Column(name="question_concept_id")
    public Long getQuestionConceptId() {
        return questionConceptId;
    }
    public void setQuestionConceptId(Long questionConceptId) {
        this.questionConceptId = questionConceptId;
    }
    public SurveyQuestionMap questionConceptId(Long val) {
        this.questionConceptId = val;
        return this;
    }

    @Column(name="survey_order_number")
    public int getSurveyOrderNumber() {
        return surveyOrderNumber;
    }
    public void setSurveyOrderNumber(int surveyOrderNumber) {
        this.surveyOrderNumber = surveyOrderNumber;
    }
    public SurveyQuestionMap surveyOrderNumber(int val) {
        this.surveyOrderNumber = val;
        return this;
    }

    @Column(name="question_order_number")
    public int getQuestionOrderNumber() {
        return questionOrderNumber;
    }
    public void setQuestionOrderNumber(int questionOrderNumber) {
        this.questionOrderNumber = questionOrderNumber;
    }
    public SurveyQuestionMap questionOrderNumber(int val) {
        this.questionOrderNumber = val;
        return this;
    }

    @Column(name="path")
    public String getPath() {
        return path;
    }
    public void setPath(String path) {
        this.path = path;
    }
    public SurveyQuestionMap path(String val) {
        this.path = val;
        return this;
    }

    @Column(name="sub")
    public int getSub() {
        return sub;
    }
    public void setSub(int sub) {
        this.sub = sub;
    }
    public SurveyQuestionMap sub(int val) {
        this.sub = val;
        return this;
    }

    @Override
    public String toString() {
        return "SurveyQuestionMap{" +
                "id=" + id +
                ", surveyConceptId=" + surveyConceptId +
                ", questionConceptId=" + questionConceptId +
                ", surveyOrderNumber=" + surveyOrderNumber +
                ", questionOrderNumber=" + questionOrderNumber +
                ", path='" + path + '\'' +
                ", sub=" + sub +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SurveyQuestionMap that = (SurveyQuestionMap) o;
        return id == that.id &&
                surveyConceptId == that.surveyConceptId &&
                questionConceptId == that.questionConceptId &&
                surveyOrderNumber == that.surveyOrderNumber &&
                questionOrderNumber == that.questionOrderNumber &&
                Objects.equals(path, that.path) &&
                sub == that.sub;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, surveyConceptId, questionConceptId, surveyOrderNumber, questionOrderNumber, path, sub);
    }
}