package org.pmiops.workbench.cdr.dao;

import com.google.common.collect.ImmutableList;
import java.util.ArrayList;
import java.util.stream.Stream;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;
import org.pmiops.workbench.cdr.ConceptMapper;
import org.pmiops.workbench.model.Domain;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import org.pmiops.workbench.model.StandardConceptFilter;
import org.pmiops.workbench.model.TestFilter;
import org.pmiops.workbench.model.OrderFilter;
import com.google.common.base.Strings;
import org.pmiops.workbench.model.MatchType;
import org.apache.commons.lang3.StringUtils;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.cdr.model.DbConcept;
import org.pmiops.workbench.model.Concept;
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

    public Slice<DbConcept> searchConcepts(String query, StandardConceptFilter standardConceptFilter, List<Long> conceptIds, List<String> vocabularyIds, String domainId, int limit, int minCount, int page,
                                         TestFilter testFilter, OrderFilter orderFilter) {


        Specification<DbConcept> conceptSpecification =
                (root, criteriaQuery, criteriaBuilder) -> {
                    List<Predicate> predicates = new ArrayList<>();
                    List<Predicate> standardConceptPredicates = new ArrayList<>();
                    standardConceptPredicates.add(root.get("standardConcept").in(STANDARD_CONCEPT_CODE, CLASSIFICATION_CONCEPT_CODE));

                    List<Predicate> nonStandardConceptPredicates = new ArrayList<>();
                    nonStandardConceptPredicates.add(criteriaBuilder.not
                            (root.get("standardConcept").in(STANDARD_CONCEPT_CODE, CLASSIFICATION_CONCEPT_CODE)));

                    String keyword = modifyMultipleMatchKeyword(query, SearchType.CONCEPT_SEARCH);

                    Pattern regex = Pattern.compile("[$&+,:;=\\\\?@#|/'<>.^*()%!-]");
                    if (keyword != null && regex.matcher(keyword).find() && keyword.length() == 1) {
                        keyword = "\"" + keyword + "\"";
                        keyword = escapeSpecialCharacters(keyword);
                    }

                    Expression<Double> matchExp = null;

                    if (keyword != null) {
                        matchExp = criteriaBuilder.function("matchConcept", Double.class,
                                root.get("conceptName"), root.get("conceptCode"), root.get("vocabularyId"),
                                root.get("synonymsStr"), criteriaBuilder.literal(keyword));
                        predicates.add(criteriaBuilder.greaterThan(matchExp, 0.0));
                    }

                    if (standardConceptFilter.equals(StandardConceptFilter.STANDARD_CONCEPTS)) {
                            predicates.add(criteriaBuilder.or(standardConceptPredicates.toArray(new Predicate[0])));
                    } else if (standardConceptFilter.equals(StandardConceptFilter.NON_STANDARD_CONCEPTS)) {
                        predicates.add(
                                criteriaBuilder.or(
                                        criteriaBuilder.or(criteriaBuilder.isNull(root.get("standardConcept"))),
                                        criteriaBuilder.and(nonStandardConceptPredicates.toArray(new Predicate[0]))
                                ));

                    } else if (standardConceptFilter.equals(StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH)) {
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
                            if (testFilter.equals(TestFilter.SELECTED) && orderFilter.equals(OrderFilter.UNSELECTED)) {
                                predicates.add(criteriaBuilder.equal(root.get("dbMeasurementConceptInfo").get("hasValues"), 1));
                            } else if (testFilter.equals(TestFilter.UNSELECTED) && orderFilter.equals(OrderFilter.SELECTED)) {
                                predicates.add(criteriaBuilder.equal(root.get("dbMeasurementConceptInfo").get("hasValues"), 0));
                            } else if (testFilter.equals(TestFilter.UNSELECTED) && orderFilter.equals(OrderFilter.UNSELECTED)) {
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
        Pageable pageable = PageRequest.of(page, limit,
                Sort.by(Direction.DESC, "countValue"));
        NoCountFindAllDao<DbConcept, Long> conceptDao = new NoCountFindAllDao<>(DbConcept.class,
                entityManager);
        return conceptDao.findAll(conceptSpecification, pageable);
    }

    public ConceptIds classifyConceptIds(Set<Long> conceptIds) {
        ImmutableList.Builder<Long> standardConceptIds = ImmutableList.builder();
        ImmutableList.Builder<Long> sourceConceptIds = ImmutableList.builder();

        Iterable<DbConcept> concepts = conceptDao.findAllById(conceptIds);
        for (DbConcept concept : concepts) {
            if (ConceptService.STANDARD_CONCEPT_CODE.equals(concept.getStandardConcept())
                    || ConceptService.CLASSIFICATION_CONCEPT_CODE.equals(concept.getStandardConcept())) {
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

    // Escaping function to safely handle special characters
    private String escapeSpecialCharacters(String input) {
        return input.replaceAll("<", "\\<")  // Escape less-than
                .replaceAll(">", "\\>"); // Escape greater-than
    }

    public List<Long> getDrugIngredientsByBrand(String query) {
        Pattern regex = Pattern.compile("[$&+,:;=\\\\?@#|/'<>.^*()%!-]");
        if (query != null && regex.matcher(query).find() && query.length() == 1) {
           query = "\"" + query + "\"";
           query = escapeSpecialCharacters(query);
        }
        return conceptDao.findDrugIngredientsByBrand(query);
    }

    public ConceptListResponse getConcepts(SearchConceptsRequest searchConceptsRequest) {
        Integer maxResults = searchConceptsRequest.getMaxResults();
        if(maxResults == null || maxResults == 0){
            maxResults = Integer.MAX_VALUE;
        }

        List<Long> drugConcepts = new ArrayList<>();

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

        StandardConceptFilter convertedConceptFilter = StandardConceptFilter.valueOf(standardConceptFilter.name());

        TestFilter testFilter = (domainId != null && domainId.equals("Measurement") && searchConceptsRequest.getMeasurementTests() != null) ? (searchConceptsRequest.getMeasurementTests() == 1 ? TestFilter.SELECTED : TestFilter.UNSELECTED): TestFilter.SELECTED;
        OrderFilter orderFilter = (domainId != null && domainId.equals("Measurement") && searchConceptsRequest.getMeasurementOrders() != null) ? (searchConceptsRequest.getMeasurementOrders() == 1 ? OrderFilter.SELECTED : OrderFilter.UNSELECTED) : OrderFilter.SELECTED;

        if(searchConceptsRequest.getDomain() != null && searchConceptsRequest.getDomain().equals(Domain.DRUG) && searchConceptsRequest.getQuery() != null && !searchConceptsRequest.getQuery().isEmpty()) {
            drugConcepts = getDrugIngredientsByBrand(searchConceptsRequest.getQuery());
        }

        Slice<DbConcept> concepts = searchConcepts(searchConceptsRequest.getQuery(), convertedConceptFilter, drugConcepts,
                searchConceptsRequest.getVocabularyIds(), domainId, maxResults, minCount,
                (searchConceptsRequest.getPageNumber() == null) ? 0 : searchConceptsRequest.getPageNumber(), testFilter, orderFilter);

        ConceptListResponse response = new ConceptListResponse();

        Boolean codeIdMatch = false;
        Boolean codeMatch = false;
        String matchedConceptName = "";
        List<Long> conceptCodeIdMatches = new ArrayList<>();

        for(DbConcept con : concepts.getContent()){
            String conceptCode = con.getConceptCode();
            boolean isConceptCodeOrId = StringUtils.isEmpty(searchConceptsRequest.getQuery()) ? false : Stream.of(conceptCode, String.valueOf(con.getConceptId())).anyMatch(searchConceptsRequest.getQuery()::equals);

            if((con.getStandardConcept() == null || !con.getStandardConcept().equals("S") ) && isConceptCodeOrId) {
                List<Concept> standardConcepts = getStandardConcepts(con.getConceptId());
                con.setStandardConcepts(standardConcepts);
            }

            if(!Strings.isNullOrEmpty(searchConceptsRequest.getQuery())) {
                if (isConceptCodeOrId) {
                    codeIdMatch = true;
                    conceptCodeIdMatches.add(con.getConceptId());
                    con.setMatchType(conceptCode.equals(searchConceptsRequest.getQuery()) ? MatchType.CODE : MatchType.ID);
                    matchedConceptName = con.getConceptName();
                    codeMatch = conceptCode.equals(searchConceptsRequest.getQuery());
                } else {
                    con.setMatchType(MatchType.NAME);
                }
            }
        }

        List<Concept> conceptList = new ArrayList<>();

        if (concepts.getContent() != null) {
            conceptList = concepts.getContent().stream()
                    .map(conceptMapper::dbModelToClient)
                    .collect(Collectors.toList());

            if(codeIdMatch) {
                conceptList = conceptList.stream().filter(c -> conceptCodeIdMatches.contains(c.getConceptId())).collect(Collectors.toList());
            }
        }
        response.setItems(conceptList);
        response.setMatchType(codeIdMatch ? (codeMatch ? MatchType.CODE : MatchType.ID) : MatchType.NAME);
        response.setMatchedConceptName(matchedConceptName);
        return response;
    }
}