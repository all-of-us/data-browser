package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.DbConcept;
import org.pmiops.workbench.cdr.model.VocabularyCount;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface ConceptDao extends CrudRepository<DbConcept, Long> {
    List<DbConcept> findAll();

    @Query(nativeQuery=true, value="select c.* from concept c join concept_relationship cr on c.concept_id=cr.concept_id_2 " +
            "where cr.concept_id_1=?1 and cr.relationship_id='Maps to' and c.can_select=1")
    List<DbConcept> findStandardConcepts(long concept_id);

    @Query(value="select c.* from concept c "+
            "join concept_relationship rel on " +
            "rel.concept_id_1 = c.concept_id and rel.concept_id_2 = :conceptId and " +
            "rel.relationship_id = 'maps to' where c.source_count_value > :minCount order " +
            "by c.count_value desc",nativeQuery=true)
    List<DbConcept> findSourceConcepts(@Param("conceptId") long conceptId,@Param("minCount") Integer minCount);

    @Query(value = "select distinct cr.concept_id_2 from cb_criteria_relationship cr \n" +
            "join concept c1 on (cr.concept_id_2 = c1.concept_id\n" +
            "and cr.concept_id_1 in (select distinct concept_id from cb_criteria c where c.domain_id='DRUG' and c.type='BRAND' and match(c.name, c.code) against(?1 in boolean mode) > 0)\n" +
            "and c1.concept_class_id = 'Ingredient') join cb_criteria c on c.concept_id = cr.concept_id_2\n" +
            "and c.domain_id = 'DRUG' and c.type = 'RXNORM' and c.synonyms like '%drug_rank1%' ", nativeQuery= true)
    List<Long> findDrugIngredientsByBrand(String query);

    @Query(value = "select distinct c.concept_id from cb_criteria c\n" +
            "inner join ( \n" +
            "select cr.concept_id_2 from cb_criteria_relationship cr \n" +
            "join concept c1 on (cr.concept_id_2 = c1.concept_id\n" +
            "and cr.concept_id_1 in (select distinct concept_id from cb_criteria c where c.domain_id='DRUG' and c.type='BRAND' and match(c.name, c.code) against(?1 in boolean mode) > 0)\n" +
            "and c1.concept_class_id = 'Ingredient' and cr.concept_id_2 not in (?2)) ) cr1 on c.concept_id = cr1.concept_id_2\n" +
            "and c.domain_id = 'DRUG' and c.type = 'RXNORM' and c.synonyms like '%drug_rank1%' in boolean mode) ", nativeQuery= true)
    List<Long> findDrugIngredientsByBrandNotInConceptIds(String query, List<Long> conceptIds);

}
