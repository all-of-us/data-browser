package org.pmiops.workbench.cdr;

import org.hibernate.boot.model.FunctionContributions;
import org.hibernate.type.BasicTypeRegistry;
import org.hibernate.type.StandardBasicTypes;
import org.hibernate.query.sqm.function.SqmFunctionRegistry;


public class MySQLDialect extends org.hibernate.community.dialect.MySQL5Dialect {

  @Override
  public void initializeFunctionRegistry(FunctionContributions functionContributions) {

    super.initializeFunctionRegistry(functionContributions);
    BasicTypeRegistry basicTypeRegistry =
            functionContributions.getTypeConfiguration().getBasicTypeRegistry();
    SqmFunctionRegistry functionRegistry = functionContributions.getFunctionRegistry();

    // Define the custom "match" function to use "match(column) against (<string> in boolean mode)"
    // for MySQL.
    // Because MATCH returns a number, we need to have this function use DOUBLE.

    functionRegistry
            .registerPattern(
                    "match",
                    "match(?1) against  (?2 in boolean mode)",
                    basicTypeRegistry.resolve(StandardBasicTypes.DOUBLE));

    // Define matchConcept to use "match(<concept>.concept_name, <concept>.concept_code,
    // <concept>.vocabulary_id,
    // <concept>.synonyms) against (<string> in boolean mode)". Clients must pass in each of the
    // corresponding fields -- conceptName, conceptCode, vocabularyId, synonymsStr --
    // to make JQL alias resolution work properly. Example:
    // matchConcept(c.conceptName, c.conceptCode, c.vocabularyId, c.synonymsStr, ?1) > 0
    functionRegistry
            .registerPattern(
                    "matchConcept",
                    "match(?1, ?2, ?3, ?4) against (?5 in boolean mode)",
                    basicTypeRegistry.resolve(StandardBasicTypes.DOUBLE));

    // Register SUBSTRING_INDEX function
    functionRegistry
            .registerPattern(
                    "substring_index",
                    "SUBSTRING_INDEX(?1, ?2, ?3)",
                    basicTypeRegistry.resolve(StandardBasicTypes.STRING));
  }
}
