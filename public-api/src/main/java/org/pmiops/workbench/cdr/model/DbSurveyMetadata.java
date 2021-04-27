package org.pmiops.workbench.cdr.model;

import javax.persistence.Table;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EmbeddedId;
import javax.persistence.Transient;
import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import org.pmiops.workbench.cdr.model.DbSurveyMetadataId;

@Entity
@Table(name = "survey_metadata")
public class DbSurveyMetadata {
    private long id;
    private String conceptName;
    private String conceptCode;
    private String surveyName;
    private long countValue;
    private int sub;
    private int is_parent_question;
    private int generate_counts;
    private int orderNumber;
    private String questionString;
    private DbAchillesAnalysis countAnalysis;
    private DbAchillesAnalysis genderAnalysis;
    private DbAchillesAnalysis ageAnalysis;
    private DbAchillesAnalysis versionAnalysis;
    private DbAchillesAnalysis participantCountAnalysis;
    private DbSurveyMetadataId dbSurveyMetadataId;
    private String type;

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name="conceptId",
                    column=@Column(name="concept_id")),
            @AttributeOverride(name="surveyConceptId",
                    column=@Column(name="survey_concept_id")),
            @AttributeOverride(name="path",
                    column=@Column(name="path"))
    })
    public DbSurveyMetadataId getDbSurveyMetadataId() {
        return dbSurveyMetadataId;
    }

    public void setDbSurveyMetadataId(DbSurveyMetadataId dbSurveyMetadataId) {
        this.dbSurveyMetadataId = dbSurveyMetadataId;
    }

    public DbSurveyMetadata dbSurveyMetadataId(DbSurveyMetadataId dbSurveyMetadataId) {
        this.dbSurveyMetadataId = dbSurveyMetadataId;
        return this;
    }

    @Column(name = "id")
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public DbSurveyMetadata id(long id) {
        this.id = id;
        return this;
    }

    @Column(name = "concept_name")
    public String getConceptName() {
        return conceptName;
    }

    public void setConceptName(String conceptName) {
        this.conceptName = conceptName;
    }

    public DbSurveyMetadata conceptName(String conceptName) {
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

    public DbSurveyMetadata questionString(String questionString) {
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

    public DbSurveyMetadata conceptCode(String conceptCode) {
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

    public DbSurveyMetadata surveyName(String surveyName) {
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

    public DbSurveyMetadata count(long count) {
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

    public DbSurveyMetadata sub(int sub) {
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
    public DbSurveyMetadata isParentQuestion(int is_parent_question) {
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
    public DbSurveyMetadata generateCounts(int generate_counts) {
        this.generate_counts = generate_counts;
        return this;
    }

    @Column(name = "order_number")
    public int getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(int orderNumber) {
        this.orderNumber = orderNumber;
    }

    public DbSurveyMetadata orderNumber(int orderNumber) {
        this.orderNumber = orderNumber;
        return this;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public DbSurveyMetadata type(String type) {
        this.type = type;
        return this;
    }

    @Transient
    public DbAchillesAnalysis getCountAnalysis() {
        return countAnalysis;
    }

    public void setCountAnalysis(DbAchillesAnalysis analysis) {
        this.countAnalysis = analysis;
    }

    public DbSurveyMetadata countAnalysis(DbAchillesAnalysis analysis) {
        this.countAnalysis = analysis;
        return this;
    }

    @Transient
    public DbAchillesAnalysis getGenderAnalysis() {
        return this.genderAnalysis;
    }

    public void setGenderAnalysis(DbAchillesAnalysis analysis) {
        this.genderAnalysis = analysis;
    }

    public DbSurveyMetadata genderAnalysis(DbAchillesAnalysis analysis) {
        this.genderAnalysis = analysis;
        return this;
    }

    @Transient
    public DbAchillesAnalysis getAgeAnalysis() {
        return this.ageAnalysis;
    }

    public void setAgeAnalysis(DbAchillesAnalysis analysis) {
        this.ageAnalysis = analysis;
    }

    public DbSurveyMetadata ageAnalysis(DbAchillesAnalysis analysis) {
        this.ageAnalysis = analysis;
        return this;
    }

    @Transient
    public DbAchillesAnalysis getVersionAnalysis() {
        return this.versionAnalysis;
    }

    public void setVersionAnalysis(DbAchillesAnalysis analysis) {
        this.versionAnalysis = analysis;
    }

    public DbSurveyMetadata versionAnalysis(DbAchillesAnalysis analysis) {
        this.versionAnalysis = analysis;
        return this;
    }

    @Transient
    public DbAchillesAnalysis getParticipantCountAnalysis() {
        return this.participantCountAnalysis;
    }

    public void setParticipantCountAnalysis(DbAchillesAnalysis analysis) {
        this.participantCountAnalysis = analysis;
    }

    public DbSurveyMetadata participantCountAnalysis(DbAchillesAnalysis analysis) {
        this.participantCountAnalysis = analysis;
        return this;
    }
}