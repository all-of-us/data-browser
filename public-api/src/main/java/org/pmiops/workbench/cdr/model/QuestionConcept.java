package org.pmiops.workbench.cdr.model;

import javax.persistence.*;
import java.util.*;
import javax.persistence.Entity;
import javax.persistence.EmbeddedId;
import org.pmiops.workbench.cdr.model.QuestionConceptId;

@Entity
@Table(name = "question_concept")
public class QuestionConcept {

    private QuestionConceptId questionConceptId;

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name="conceptId",
                    column=@Column(name="concept_id")),
            @AttributeOverride(name="surveyConceptId",
                    column=@Column(name="survey_concept_id")),
            @AttributeOverride(name="path",
                    column=@Column(name="path"))
    })
    public QuestionConceptId getQuestionConceptId() {
        return questionConceptId;
    }

    public void setQuestionConceptId(QuestionConceptId questionConceptId) {
        this.questionConceptId = questionConceptId;
    }

    public QuestionConcept questionConceptId(QuestionConceptId questionConceptId) {
        this.questionConceptId = questionConceptId;
        return this;
    }

    private String conceptName;
    private String conceptCode;
    private String surveyName;
    private long countValue;
    private int sub;
    private int is_parent_question;
    private int generate_counts;
    private int questionOrderNumber;
    private String questionString;
    private AchillesAnalysis countAnalysis;
    private AchillesAnalysis genderAnalysis;
    private AchillesAnalysis ageAnalysis;

    @Column(name = "concept_name")
    public String getConceptName() {
        return conceptName;
    }

    public void setConceptName(String conceptName) {
        this.conceptName = conceptName;
    }

    public QuestionConcept conceptName(String conceptName) {
        this.conceptName = conceptName;
        return this;
    }

    @Column(name = "question_string")
    public String getQuestionString() {
        return questionString;
    }

    public void setQuestionString(String questionString) {
        this.questionString = questionString;
    }

    public QuestionConcept questionString(String questionString) {
        this.questionString = questionString;
        return this;
    }

    @Column(name = "concept_code")
    public String getConceptCode() {
        return conceptCode;
    }

    public void setConceptCode(String conceptCode) {
        this.conceptCode = conceptCode;
    }

    public QuestionConcept conceptCode(String conceptCode) {
        this.conceptCode = conceptCode;
        return this;
    }

    @Column(name = "survey_name")
    public String getSurveyName() {
        return surveyName;
    }

    public void setSurveyName(String surveyName) {
        this.surveyName = surveyName;
    }

    public QuestionConcept surveyName(String surveyName) {
        this.surveyName = surveyName;
        return this;
    }

    @Column(name = "count_value")
    public long getCountValue() {
        return countValue;
    }

    public void setCountValue(long count) {
        this.countValue = count;
    }

    public QuestionConcept count(long count) {
        this.countValue = count;
        return this;
    }

    @Column(name = "sub")
    public int getSub() {
        return sub;
    }

    public void setSub(int sub) {
        this.sub = sub;
    }

    public QuestionConcept sub(int sub) {
        this.sub = sub;
        return this;
    }

    @Column(name = "is_parent_question")
    public int getIsParentQuestion() {
        return is_parent_question;
    }
    public void setIsParentQuestion(int is_parent_question) {
        this.is_parent_question = is_parent_question;
    }
    public QuestionConcept isParentQuestion(int is_parent_question) {
        this.is_parent_question = is_parent_question;
        return this;
    }

    @Column(name = "generate_counts")
    public int getGenerateCounts() {
        return generate_counts;
    }
    public void setGenerateCounts(int generate_counts) {
        this.generate_counts = generate_counts;
    }
    public QuestionConcept generateCounts(int generate_counts) {
        this.generate_counts = generate_counts;
        return this;
    }

    @Column(name = "question_order_number")
    public int getQuestionOrderNumber() {
        return questionOrderNumber;
    }

    public void setQuestionOrderNumber(int questionOrderNumber) {
        this.questionOrderNumber = questionOrderNumber;
    }

    public QuestionConcept questionOrderNumber(int questionOrderNumber) {
        this.questionOrderNumber = questionOrderNumber;
        return this;
    }

    @Transient
    public AchillesAnalysis getCountAnalysis() {
        return countAnalysis;
    }

    public void setCountAnalysis(AchillesAnalysis analysis) {
        this.countAnalysis = analysis;
    }

    public QuestionConcept countAnalysis(AchillesAnalysis analysis) {
        this.countAnalysis = analysis;
        return this;
    }

    @Transient
    public AchillesAnalysis getGenderAnalysis() {
        return this.genderAnalysis;
    }

    public void setGenderAnalysis(AchillesAnalysis analysis) {
        this.genderAnalysis = analysis;
    }

    public QuestionConcept genderAnalysis(AchillesAnalysis analysis) {
        this.genderAnalysis = analysis;
        return this;
    }

    @Transient
    public AchillesAnalysis getAgeAnalysis() {
        return this.ageAnalysis;
    }

    public void setAgeAnalysis(AchillesAnalysis analysis) {
        this.ageAnalysis = analysis;
    }

    public QuestionConcept ageAnalysis(AchillesAnalysis analysis) {
        this.ageAnalysis = analysis;
        return this;
    }
}