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
import org.apache.commons.lang3.builder.ToStringBuilder;


@Entity
//TODO need to add a way to dynamically switch between database versions
//this dynamic connection will eliminate the need for the catalog attribute
@Table(name = "concept")
public class Concept {

    private long conceptId;
    private String conceptName;
    private String standardConcept;
    private String conceptCode;
    private String conceptClassId;
    private String vocabularyId;
    private String domainId;
    private long countValue;
    private Long sourceCountValue;
    private float prevalence;
    private List<String> synonyms = new ArrayList<>();
    private String synonymsStr;

    public Concept() {}

    // Copy constructor for copying everything but synonyms
    public Concept(Concept a) {
        this.conceptId(a.getConceptId())
                .conceptName(a.getConceptName())
                .standardConcept(a.getStandardConcept())
                .conceptCode(a.getConceptCode())
                .conceptClassId(a.getConceptClassId())
                .vocabularyId(a.getVocabularyId())
                .domainId(a.getDomainId())
                .count(a.getCountValue())
                .sourceCountValue(a.getSourceCountValue())
                .prevalence(a.getPrevalence())
                .synonymsStr(a.getSynonymsStr());
    }

    @Id
    @Column(name = "concept_id")
    public long getConceptId() {
        return conceptId;
    }

    public void setConceptId(long conceptId) {
        this.conceptId = conceptId;
    }

    public Concept conceptId(long conceptId) {
        this.conceptId = conceptId;
        return this;
    }

    @Column(name = "concept_name")
    public String getConceptName() {
        return conceptName;
    }

    public void setConceptName(String conceptName) {
        this.conceptName = conceptName;
    }

    public Concept conceptName(String conceptName) {
        this.conceptName = conceptName;
        return this;
    }

    @Column(name = "standard_concept")
    public String getStandardConcept() {
        return standardConcept;
    }

    public void setStandardConcept(String standardConcept) {
        this.standardConcept = standardConcept;
    }

    public Concept standardConcept(String standardConcept) {
        this.standardConcept = standardConcept;
        return this;
    }

    @Column(name = "concept_code")
    public String getConceptCode() {
        return conceptCode;
    }

    public void setConceptCode(String conceptCode) {
        this.conceptCode = conceptCode;
    }

    public Concept conceptCode(String conceptCode) {
        this.conceptCode = conceptCode;
        return this;
    }
    @Column(name = "concept_class_id")
    public String getConceptClassId() {
        return conceptClassId;
    }

    public void setConceptClassId(String conceptClassId) {
        this.conceptClassId = conceptClassId;
    }

    public Concept conceptClassId(String conceptClassId) {
        this.conceptClassId = conceptClassId;
        return this;
    }

    @Column(name = "vocabulary_id")
    public String getVocabularyId() {
        return vocabularyId;
    }

    public void setVocabularyId(String vocabularyId) {
        this.vocabularyId = vocabularyId;
    }

    public Concept vocabularyId(String vocabularyId) {
        this.vocabularyId = vocabularyId;
        return this;
    }

    @Column(name = "domain_id")
    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public Concept domainId(String domainId) {
        this.domainId = domainId;
        return this;
    }


    @Column(name= "count_value")
    public long getCountValue() {
        return countValue;
    }

    public void setCountValue(long count) {
        this.countValue = count;
    }

    public Concept count(long count) {
        this.countValue = count;
        return this;
    }

    @Column(name= "source_count_value")
    public Long getSourceCountValue() {
        return sourceCountValue;
    }

    public void setSourceCountValue(Long count) {
        this.sourceCountValue = count;
    }

    public Concept sourceCountValue(Long count) {
        this.sourceCountValue = count;
        return this;
    }

    @Column(name = "prevalence")
    public float getPrevalence() {
        return prevalence;
    }

    public void setPrevalence(float prevalence) {
        this.prevalence = prevalence;
    }

    public Concept prevalence(float prevalence) {
        this.prevalence = prevalence;
        return this;
    }

    @Column(name = "synonyms")
    public String getSynonymsStr() {
        return synonymsStr;
    }

    public void setSynonymsStr(String synonymsStr) {
        this.synonymsStr = synonymsStr;
        synonyms.clear();
        if (synonymsStr != null) {
            String[] parts = synonymsStr.split("(?<!\\|)\\|(?!\\|)");
            if (parts.length > 1) {
                // Skip the concept ID (which appears in synonymsStr first),
                // and the concept name if it shows up in the pipe-concatenated synonyms;
                // unescape || to |.
                synonyms.addAll(Arrays.asList(parts).subList(1, parts.length).stream()
                    .filter((part) -> !Strings.isNullOrEmpty(part) && !part.equals(conceptName))
                    .map((part) -> part.replaceAll("\\|\\|", "|"))
                    .collect(Collectors.toList()));
            }
        }
    }

    public Concept synonymsStr(String synonymsStr) {
        setSynonymsStr(synonymsStr);
        return this;
    }


    @Transient
    public List<String> getSynonyms() {
        return synonyms;
    }
    public void setSynonyms(List<String> synonyms) {
        this.synonyms = synonyms;
    }
    public Concept synonyms(List<String> synonyms) {
        this.synonyms = synonyms;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Concept concept = (Concept) o;
        return conceptId == concept.conceptId &&
                countValue == concept.countValue &&
                Float.compare(concept.prevalence, prevalence) == 0 &&
                Objects.equals(conceptName, concept.conceptName) &&
                Objects.equals(standardConcept, concept.standardConcept) &&
                Objects.equals(conceptCode, concept.conceptCode) &&
                Objects.equals(conceptClassId, concept.conceptClassId) &&
                Objects.equals(vocabularyId, concept.vocabularyId) &&
                Objects.equals(sourceCountValue,concept.sourceCountValue) &&
                Objects.equals(domainId, concept.domainId) &&
                Objects.equals(synonymsStr, concept.synonymsStr);
    }

    @Override
    public int hashCode() {
        return Objects.hash(conceptId, conceptName, standardConcept, conceptCode, conceptClassId, vocabularyId, domainId, countValue, sourceCountValue,prevalence);
    }

    @Override
    public String toString() {
        return  ToStringBuilder.reflectionToString(this);

    }
}
