
# Concept

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**conceptId** | **Long** | id of the concept | 
**conceptName** | **String** | name of concept | 
**domainId** | **String** | domain of concept | 
**vocabularyId** | **String** | vocabulary of concept | 
**conceptCode** | **String** | original vocab code of concept | 
**conceptClassId** | **String** | class of concept | 
**standardConcept** | **String** | standard concept value 1 char | 
**countValue** | **Long** | est count in the cdr |  [optional]
**sourceCountValue** | **Long** | est source count in the cdr |  [optional]
**prevalence** | **Float** | prevalence among participants percent count divided num participants |  [optional]
**conceptSynonyms** | **List&lt;String&gt;** | concept synonym names |  [optional]
**canSelect** | **Integer** | filters clickable concepts |  [optional]
**measurementConceptInfo** | [**MeasurementConceptInfo**](MeasurementConceptInfo.md) | measurement concept info |  [optional]
**drugBrands** | **List&lt;String&gt;** | drug brand names |  [optional]
**graphToShow** | **String** | graph to show when first expanded |  [optional]



