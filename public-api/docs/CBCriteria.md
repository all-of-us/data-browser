
# CBCriteria

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **Long** | Primary identifier which is unique within a CDR version. | 
**parentId** | **Long** | The parent id of the criteria. 0 if this is the root node of a criteria tree | 
**type** | **String** | type of this criteria | 
**subtype** | **String** | sub type of this criteria |  [optional]
**code** | **String** | concept code |  [optional]
**name** | **String** | concept name | 
**group** | **Boolean** | boolean field which represents if the criteria has children |  [optional]
**selectable** | **Boolean** | boolean field which represents if the criteria is selectable |  [optional]
**count** | **Long** | count |  [optional]
**sourceCount** | **Long** | count |  [optional]
**domainId** | **String** | domain id |  [optional]
**conceptId** | **String** | concept id |  [optional]
**path** | **String** | path of concept in the criteria tree | 
**synonyms** | **String** | synonyms |  [optional]
**canSelect** | **Integer** | filters clickable concepts |  [optional]



