package org.pmiops.workbench.cdr.dao;

import static com.google.common.truth.Truth.assertThat;

import org.junit.Before;
import org.junit.Test;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import org.junit.runner.RunWith;
import org.pmiops.workbench.cdr.model.DbCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.jdbc.core.JdbcTemplate;

@RunWith(SpringRunner.class)
@DataJpaTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class CbCriteriaDaoTest {

    @Autowired private CBCriteriaDao cbCriteriaDao;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Before
    public void setUp() {
        cbCriteriaDao.save(
                new DbCriteria()
                        .id(330015)
                        .parentId(0)
                        .type("SNOMED")
                        .code("404684003")
                        .name("Clinical finding")
                        .group(true)
                        .selectable(false)
                        .count(-1L)
                        .conceptId("441840")
                        .domainId("CONDITION")
                        .attribute(false)
                        .path("330015")
                        .hierarchy(true)
                        .ancestorData(false)
                        .standard(false));
        cbCriteriaDao.save(
                new DbCriteria()
                        .id(330031)
                        .parentId(330015)
                        .type("SNOMED")
                        .code("118234003")
                        .name("Finding by site")
                        .group(true)
                        .selectable(true)
                        .count(1000L)
                        .conceptId("4042140")
                        .domainId("CONDITION")
                        .attribute(false)
                        .path("330015.330031")
                        .hierarchy(true)
                        .ancestorData(false)
                        .standard(false));
        cbCriteriaDao.save(
                new DbCriteria()
                        .id(330367)
                        .parentId(330031)
                        .type("SNOMED")
                        .code("106063007")
                        .name("Cardiovascular finding")
                        .group(true)
                        .selectable(true)
                        .count(1000L)
                        .conceptId("4023995")
                        .domainId("CONDITION")
                        .attribute(false)
                        .path("330015.330031.330367")
                        .hierarchy(true)
                        .ancestorData(false)
                        .standard(false));
        cbCriteriaDao.save(
                new DbCriteria()
                        .id(332587)
                        .parentId(330367)
                        .type("SNOMED")
                        .code("366157005")
                        .name("Cardiovascular measurement - finding")
                        .group(true)
                        .selectable(true)
                        .count(1000L)
                        .conceptId("4277352")
                        .domainId("CONDITION")
                        .attribute(false)
                        .path("330015.330031.330367.332587")
                        .hierarchy(true)
                        .ancestorData(false)
                        .standard(false));
        cbCriteriaDao.save(
                new DbCriteria()
                        .id(339450)
                        .parentId(332587)
                        .type("SNOMED")
                        .code("38341003")
                        .name("Hypertensive disorder")
                        .group(true)
                        .selectable(true)
                        .count(1000L)
                        .conceptId("316866")
                        .domainId("CONDITION")
                        .attribute(false)
                        .path("330015.330031.330367.332587.339450")
                        .hierarchy(true)
                        .ancestorData(false)
                        .standard(false)
                        .synonyms("condition_rank1"));
        cbCriteriaDao.save(
                new DbCriteria()
                        .id(356476)
                        .parentId(339450)
                        .type("SNOMED")
                        .code("59621000")
                        .name("Essential hypertension")
                        .group(true)
                        .selectable(true)
                        .count(1000L)
                        .conceptId("320128")
                        .domainId("CONDITION")
                        .attribute(false)
                        .path("330015.330031.330367.332587.339450.356476")
                        .hierarchy(true)
                        .ancestorData(false)
                        .standard(false)
                        .synonyms("condition_rank1"));
        cbCriteriaDao.save(
                new DbCriteria()
                        .id(399265)
                        .parentId(356476)
                        .type("SNOMED")
                        .code("1201005")
                        .name("Benign essential hypertension")
                        .group(true)
                        .selectable(true)
                        .count(1000L)
                        .conceptId("312648")
                        .domainId("CONDITION")
                        .attribute(false)
                        .path("330015.330031.330367.332587.339450.356476.399265")
                        .hierarchy(true)
                        .ancestorData(false)
                        .standard(false)
                        .synonyms("condition_rank1"));
    }

    @Test
    public void findCriteriaChildren() {
        jdbcTemplate.execute(
                "insert into concept(concept_id, concept_name, domain_id, vocabulary_id, concept_class_id, standard_concept, concept_code, count_value, source_count_value, can_select, has_counts) " +
                        "values (312648, 'Benign essential hypertension', 'Condition', 'SNOMED', 'Clinical Finding', 'S', '1201005', 1000, 1000, 1, 1)");
        List<DbCriteria> criteriaList = cbCriteriaDao.findCriteriaChildren(356476L);
        assertThat(criteriaList).hasSize(1);
    }
}
