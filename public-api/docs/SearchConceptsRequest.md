
# SearchConceptsRequest

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**query** | **String** | A query string that can be used to match a subset of the name (case-insensitively), the entire code value (case-insensitively), or the concept ID.  | 
**standardConceptFilter** | [**StandardConceptFilter**](StandardConceptFilter.md) | STANDARD_CONCEPTS if only standard concepts should be returned, NON_STANDARD_CONCEPTS if only non-standard concepts should be returned; defaults to ALL_CONCEPTS, meaning both standard and non-standard concepts will be returned.  |  [optional]
**vocabularyIds** | **List&lt;String&gt;** | The vocabulary ID for the concepts returned (e.g. SNOMED, RxNorm) |  [optional]
**domain** | [**Domain**](Domain.md) | The domain for the concepts returned (e.g. OBSERVATION, DRUG). Note that this may map to multiple domain ID values in OMOP.  |  [optional]
**maxResults** | **Integer** | The maximum number of results returned. Defaults to 25. |  [optional]
**minCount** | **Integer** | The minimum count of concepts to be fetched |  [optional]
**pageNumber** | **Integer** | By default it returns the first page and then its next pages from that on. |  [optional]
**measurementTests** | **Integer** | By default all the measurement tests are returned |  [optional]
**measurementOrders** | **Integer** | By default all the measurement orders are returned |  [optional]



