package org.pmiops.workbench.cdr.dao;

import com.google.common.collect.ImmutableList;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import java.util.Optional;
import javax.persistence.EntityManager;
import com.google.common.base.Strings;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.model.MatchType;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.JoinType;
import org.pmiops.workbench.model.Concept;
import org.pmiops.workbench.cdr.model.DbConcept;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.pmiops.workbench.cdr.ConceptMapper;
import org.pmiops.workbench.model.SearchConceptsRequest;
import org.pmiops.workbench.model.ConceptListResponse;
import org.pmiops.workbench.model.Domain;
import org.pmiops.workbench.model.StandardConceptFilter;

@Service
public class ConceptService {

    @PersistenceContext(unitName = "cdr")
    private EntityManager entityManager;
    @Autowired
    private ConceptDao conceptDao;
    @Autowired
    private ConceptMapper conceptMapper;

    public enum SearchType {
        CONCEPT_SEARCH, SURVEY_COUNTS, DOMAIN_COUNTS
    }

    public static class ConceptIds {

        private final List<Long> standardConceptIds;
        private final List<Long> sourceConceptIds;

        public ConceptIds(List<Long> standardConceptIds, List<Long> sourceConceptIds) {
            this.standardConceptIds = standardConceptIds;
            this.sourceConceptIds = sourceConceptIds;
        }

        public List<Long> getStandardConceptIds() {
            return standardConceptIds;
        }

        public List<Long> getSourceConceptIds() {
            return sourceConceptIds;
        }

    }

    public enum StandardConceptFilterVal {
        ALL_CONCEPTS,
        STANDARD_CONCEPTS,
        NON_STANDARD_CONCEPTS,
        STANDARD_OR_CODE_ID_MATCH
    }

    public ConceptService() {
    }

    // Used for tests
    public ConceptService(EntityManager entityManager, ConceptDao conceptDao, ConceptMapper conceptMapper) {
        this.entityManager = entityManager;
        this.conceptDao = conceptDao;
        this.conceptMapper = conceptMapper;
    }

    public static String modifyMultipleMatchKeyword(String query, SearchType searchType) {
        // This function modifies the keyword to match all the words if multiple words are present(by adding + before each word to indicate match that matching each word is essential)
        if (query == null || query.trim().isEmpty()) {
            return null;
        }
        String[] keywords = query.split("[,+\\s+]");
        List<String> modifiedWords = new ArrayList<>();
        if (keywords.length == 1) {
            return query;
        } else if (query.startsWith("\"") && query.endsWith("\"")) {
            return query;
        } else {
            for (String key: keywords) {
                if (key.length() < 3) {
                    if (searchType == SearchType.SURVEY_COUNTS) {
                        if (!key.endsWith("*")) {
                            modifiedWords.add(new String("+" + key + "*"));
                        } else {
                            modifiedWords.add(new String("+" + key));
                        }
                    } else {
                        modifiedWords.add(key);
                    }
                } else if (key.contains(".") && !key.contains("\"")) {
                    modifiedWords.add(new String("\"" + key + "\""));
                } else if (key.contains("(") && !key.contains("\"")) {
                    modifiedWords.add("+" + new String("\"" + key + "\""));
                } else if (key.contains("-")) {
                    modifiedWords.add(key);
                } else if (key.contains("*") && key.length() > 1) {
                    modifiedWords.add(key);
                } else if (key.startsWith("+")) {
                    modifiedWords.add(key);
                } else {
                    if (searchType == SearchType.SURVEY_COUNTS) {
                        if (!key.endsWith("*")) {
                            modifiedWords.add(new String("+" + key + "*"));
                        } else {
                            modifiedWords.add(new String("+" + key));
                        }
                    } else {
                        modifiedWords.add(new String("+" + key));
                    }
                }
            }
        }
        return String.join(" ", modifiedWords);
    }

    public static final String STANDARD_CONCEPT_CODE = "S";
    public static final String CLASSIFICATION_CONCEPT_CODE = "C";

    public Slice<DbConcept> searchConcepts(String query, StandardConceptFilterVal standardConceptFilter, List<Long> conceptIds, List<String> vocabularyIds, String domainId, int limit, int minCount, int page,
                                         int measurementTests, int measurementOrders) {

        Specification<DbConcept> conceptSpecification =
                (root, criteriaQuery, criteriaBuilder) -> {
                    List<Predicate> predicates = new ArrayList<>();
                    List<Predicate> standardConceptPredicates = new ArrayList<>();
                    standardConceptPredicates.add(root.get("standardConcept").in(STANDARD_CONCEPT_CODE, CLASSIFICATION_CONCEPT_CODE));

                    List<Predicate> nonStandardConceptPredicates = new ArrayList<>();
                    nonStandardConceptPredicates.add(criteriaBuilder.not
                            (root.get("standardConcept").in(STANDARD_CONCEPT_CODE, CLASSIFICATION_CONCEPT_CODE)));

                    final String keyword = modifyMultipleMatchKeyword(query, SearchType.CONCEPT_SEARCH);

                    Expression<Double> matchExp = null;

                    if (keyword != null) {
                        matchExp = criteriaBuilder.function("matchConcept", Double.class,
                                root.get("conceptName"), root.get("conceptCode"), root.get("vocabularyId"),
                                root.get("synonymsStr"), criteriaBuilder.literal(keyword));
                        predicates.add(criteriaBuilder.greaterThan(matchExp, 0.0));
                    }

                    if (standardConceptFilter.equals(StandardConceptFilterVal.STANDARD_CONCEPTS)) {
                            predicates.add(criteriaBuilder.or(standardConceptPredicates.toArray(new Predicate[0])));
                    } else if (standardConceptFilter.equals(StandardConceptFilterVal.NON_STANDARD_CONCEPTS)) {
                        predicates.add(
                                criteriaBuilder.or(
                                        criteriaBuilder.or(criteriaBuilder.isNull(root.get("standardConcept"))),
                                        criteriaBuilder.and(nonStandardConceptPredicates.toArray(new Predicate[0]))
                                ));

                    } else if (standardConceptFilter.equals(StandardConceptFilterVal.STANDARD_OR_CODE_ID_MATCH)) {
                        if (keyword != null) {
                            List<Predicate> conceptCodeMatch = new ArrayList<>();
                            List<Predicate> standardOrCodeOrIdMatch = new ArrayList<>();
                            predicates.remove(predicates.size()-1);
                            List<Predicate> conceptMatch = new ArrayList<>();
                            conceptMatch.add(criteriaBuilder.greaterThan(matchExp, 0.0));
                            conceptMatch.add(
                                    criteriaBuilder.or(standardConceptPredicates.toArray(new Predicate[0])));
                            conceptCodeMatch.add(criteriaBuilder.and(conceptMatch.toArray(new Predicate[0])));
                            standardOrCodeOrIdMatch.add(criteriaBuilder.equal(root.get("conceptCode"),
                                    criteriaBuilder.literal(query)));
                            if (conceptIds.size() > 0) {
                                standardOrCodeOrIdMatch.add(root.get("conceptId").in(conceptIds));
                            }
                            try {
                                long conceptId = Long.parseLong(query);
                                standardOrCodeOrIdMatch.add(criteriaBuilder.equal(root.get("conceptId"),
                                        criteriaBuilder.literal(conceptId)));
                            } catch (NumberFormatException e) {
                                // Not a long, don't try to match it to a concept ID.
                            }
                            conceptCodeMatch.add(criteriaBuilder.or(standardOrCodeOrIdMatch.toArray(new Predicate[0])));
                            predicates.add(criteriaBuilder.or(conceptCodeMatch.toArray(new Predicate[0])));
                        } else {
                            predicates.add(criteriaBuilder.or(standardConceptPredicates.toArray(new Predicate[0])));
                        }

                    }

                    if (vocabularyIds != null) {
                        predicates.add(root.get("vocabularyId").in(vocabularyIds));
                    }
                    if (domainId != null) {
                        if (domainId.equals("Measurement")) {
                            root.fetch("dbMeasurementConceptInfo", JoinType.LEFT);
                            if (measurementTests == 1 && measurementOrders == 0) {
                                predicates.add(criteriaBuilder.equal(root.get("dbMeasurementConceptInfo").get("hasValues"), 1));
                            } else if (measurementTests == 0 && measurementOrders == 1) {
                                predicates.add(criteriaBuilder.equal(root.get("dbMeasurementConceptInfo").get("hasValues"), 0));
                            } else if (measurementTests == 0 && measurementOrders == 0) {
                                predicates.add(criteriaBuilder.equal(root.get("dbMeasurementConceptInfo").get("hasValues"), 2));
                            }
                        }
                        predicates.add(criteriaBuilder.equal(root.get("domainId"), criteriaBuilder.literal(domainId)));
                    }
                    if (minCount == 1) {
                        predicates.add(criteriaBuilder.greaterThan(root.get("hasCounts"), 0));
                    }
                    predicates.add(criteriaBuilder.greaterThan(root.get("canSelect"), 0));
                    criteriaQuery.distinct(true);
                    return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
                };
        // Return up to limit results, sorted in descending count value order.

        Pageable pageable = new PageRequest(page, limit,
                new Sort(Direction.DESC, "countValue"));
        NoCountFindAllDao<DbConcept, Long> conceptDao = new NoCountFindAllDao<>(DbConcept.class,
                entityManager);
        return conceptDao.findAll(conceptSpecification, pageable);
    }

    public ConceptIds classifyConceptIds(Set<Long> conceptIds) {
        ImmutableList.Builder<Long> standardConceptIds = ImmutableList.builder();
        ImmutableList.Builder<Long> sourceConceptIds = ImmutableList.builder();

        Iterable<DbConcept> concepts = conceptDao.findAll(conceptIds);
        for (DbConcept concept : concepts) {
            if (STANDARD_CONCEPT_CODE.equals(concept.getStandardConcept())
                    || CLASSIFICATION_CONCEPT_CODE.equals(concept.getStandardConcept())) {
                standardConceptIds.add(concept.getConceptId());
            } else {
                // We may need to handle classification / concept hierarchy here eventually...
                sourceConceptIds.add(concept.getConceptId());
            }
        }
        return new ConceptIds(standardConceptIds.build(), sourceConceptIds.build());
    }

    public List<Concept> getStandardConcepts(Long conceptId) {
        return conceptDao.findStandardConcepts(conceptId).stream()
                .map(conceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Concept> getSourceConcepts(Long conceptId, Integer count) {
        return conceptDao.findSourceConcepts(conceptId, count).stream()
                .map(conceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Long> getDrugIngredientsByBrand(String query) {
        return conceptDao.findDrugIngredientsByBrand(query);
    }

    public ConceptListResponse getConcepts(SearchConceptsRequest searchConceptsRequest) {
        Integer maxResults = searchConceptsRequest.getMaxResults();
        if(maxResults == null || maxResults == 0){
            maxResults = Integer.MAX_VALUE;
        }
        List<Long> drugConcepts = new ArrayList<>();

        if(searchConceptsRequest.getDomain() != null && searchConceptsRequest.getDomain().equals(Domain.DRUG) && searchConceptsRequest.getQuery() != null && !searchConceptsRequest.getQuery().isEmpty()) {
            drugConcepts = getDrugIngredientsByBrand(searchConceptsRequest.getQuery());
        }

        Integer minCount = Optional.ofNullable(searchConceptsRequest.getMinCount()).orElse(1);

        StandardConceptFilter standardConceptFilter = searchConceptsRequest.getStandardConceptFilter();


        if(StringUtils.isEmpty(searchConceptsRequest.getQuery())){
            if(standardConceptFilter == null || standardConceptFilter == StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH){
                standardConceptFilter = StandardConceptFilter.STANDARD_CONCEPTS;
            }
        }else{
            if(standardConceptFilter == null){
                standardConceptFilter = StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH;
            }
        }

        String domainId = null;
        if (searchConceptsRequest.getDomain() != null) {
            domainId = CommonStorageEnums.domainToDomainId(searchConceptsRequest.getDomain());
        }

        StandardConceptFilterVal convertedConceptFilter = StandardConceptFilterVal.valueOf(standardConceptFilter.name());

        Slice<DbConcept> concepts;
        int measurementTests = 1;
        int measurementOrders = 1;

        if (domainId != null && domainId.equals("Measurement")) {
            if (searchConceptsRequest.getMeasurementTests() != null) {
                measurementTests = searchConceptsRequest.getMeasurementTests();
            }
            if (searchConceptsRequest.getMeasurementOrders() != null) {
                measurementOrders = searchConceptsRequest.getMeasurementOrders();
            }
        }
        concepts = searchConcepts(searchConceptsRequest.getQuery(), convertedConceptFilter, drugConcepts,
                searchConceptsRequest.getVocabularyIds(), domainId, maxResults, minCount,
                (searchConceptsRequest.getPageNumber() == null) ? 0 : searchConceptsRequest.getPageNumber(), measurementTests, measurementOrders);

        ConceptListResponse response = new ConceptListResponse();

        for(DbConcept con : concepts.getContent()){
            String conceptCode = con.getConceptCode();
            String conceptId = String.valueOf(con.getConceptId());

            if((con.getStandardConcept() == null || !con.getStandardConcept().equals("S") ) && (searchConceptsRequest.getQuery().equals(conceptCode) || searchConceptsRequest.getQuery().equals(conceptId))){
                response.setStandardConcepts(getStandardConcepts(con.getConceptId()));
                response.setSourceOfStandardConcepts(con.getConceptId());
            }

            if(!Strings.isNullOrEmpty(searchConceptsRequest.getQuery()) && (searchConceptsRequest.getQuery().equals(conceptCode) || searchConceptsRequest.getQuery().equals(conceptId))) {
                response.setMatchType(conceptCode.equals(searchConceptsRequest.getQuery()) ? MatchType.CODE : MatchType.ID );
                response.setMatchedConceptName(con.getConceptName());
            }
        }

        if(response.getMatchType() == null && response.getStandardConcepts() == null){
            response.setMatchType(MatchType.NAME);
        }

        List<Concept> conceptList = new ArrayList<>();

        if (concepts.getContent() != null) {
            conceptList = concepts.getContent().stream()
                    .map(conceptMapper::dbModelToClient)
                    .collect(Collectors.toList());

            if(response.getStandardConcepts() != null) {
                conceptList = conceptList.stream().filter(c -> !c.getConceptId().equals(response.getSourceOfStandardConcepts())).collect(Collectors.toList());
            }
        }
        response.setItems(conceptList);
        return response;
    }
}