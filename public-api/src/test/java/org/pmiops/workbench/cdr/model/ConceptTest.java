package org.pmiops.workbench.cdr.model;

import static com.google.common.truth.Truth.assertThat;
import org.junit.Test;

public class ConceptTest {

  @Test
  public void testSetSynonymStrIdAndCodeOnly() {
    DbConcept dbConcept = new DbConcept();
    dbConcept.setSynonymsStr("123|");
    assertThat(dbConcept.getSynonyms()).isEmpty();
  }

  @Test
  public void testSetSynonymStrIdAndCodeOneSynonym() {
    DbConcept dbConcept = new DbConcept();
    dbConcept.setSynonymsStr("123|foo bar");
    assertThat(dbConcept.getSynonyms()).containsExactly("foo bar")
        .inOrder();
  }

  @Test
  public void testSetSynonymStrIdAndCodeTwoSynonymsOneEscaped() {
    DbConcept dbConcept = new DbConcept();
    dbConcept.setSynonymsStr("123|foo bar|baz || blah");
    assertThat(dbConcept.getSynonyms()).containsExactly("foo bar",
        "baz | blah")
        .inOrder();
  }
}
