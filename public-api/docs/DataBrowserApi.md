# DataBrowserApi

All URIs are relative to *https://public-api.pmi-ops.org*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getCdrVersionUsed**](DataBrowserApi.md#getCdrVersionUsed) | **GET** /v1/databrowser/cdrversion-used | 
[**getConceptAnalysisResults**](DataBrowserApi.md#getConceptAnalysisResults) | **GET** /v1/databrowser/concept-analysis-results | 
[**getCountAnalysis**](DataBrowserApi.md#getCountAnalysis) | **GET** /v1/databrowser/count-analysis | 
[**getCriteriaChildren**](DataBrowserApi.md#getCriteriaChildren) | **GET** /v1/databrowser/getCriteriaChildren | 
[**getCriteriaRolledCounts**](DataBrowserApi.md#getCriteriaRolledCounts) | **GET** /v1/databrowser/getCriteriaRolledCounts | 
[**getDomainTotals**](DataBrowserApi.md#getDomainTotals) | **GET** /v1/databrowser/domain-totals | 
[**getFMHQuestions**](DataBrowserApi.md#getFMHQuestions) | **GET** /v1/databrowser/fmh-questions | 
[**getFMHSurveyQuestionResults**](DataBrowserApi.md#getFMHSurveyQuestionResults) | **GET** /v1/databrowser/fmh-survey-question-results | 
[**getFitbitAnalysisResults**](DataBrowserApi.md#getFitbitAnalysisResults) | **GET** /v1/databrowser/fitbit-analysis-results | 
[**getGenderAnalysis**](DataBrowserApi.md#getGenderAnalysis) | **GET** /v1/databrowser/gender-count | 
[**getParticipantCount**](DataBrowserApi.md#getParticipantCount) | **GET** /v1/databrowser/participant-count | 
[**getSourceConcepts**](DataBrowserApi.md#getSourceConcepts) | **GET** /v1/databrowser/source-concepts | 
[**getSubQuestions**](DataBrowserApi.md#getSubQuestions) | **GET** /v1/databrowser/sub-questions | 
[**getSurveyQuestionCounts**](DataBrowserApi.md#getSurveyQuestionCounts) | **GET** /v1/databrowser/survey-question-counts | 
[**getSurveyQuestionResults**](DataBrowserApi.md#getSurveyQuestionResults) | **GET** /v1/databrowser/survey-question-results | 
[**getSurveyQuestions**](DataBrowserApi.md#getSurveyQuestions) | **GET** /v1/databrowser/survey-questions | 
[**getSurveyVersionCounts**](DataBrowserApi.md#getSurveyVersionCounts) | **GET** /v1/databrowser/survey-version-counts | 
[**searchConcepts**](DataBrowserApi.md#searchConcepts) | **POST** /v1/databrowser/searchConcepts | 


<a name="getCdrVersionUsed"></a>
# **getCdrVersionUsed**
> CdrVersion getCdrVersionUsed()



Gets the cdr versions

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
try {
    CdrVersion result = apiInstance.getCdrVersionUsed();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getCdrVersionUsed");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CdrVersion**](CdrVersion.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getConceptAnalysisResults"></a>
# **getConceptAnalysisResults**
> ConceptAnalysisListResponse getConceptAnalysisResults(conceptIds, domainId)



Gets analysis results for concept

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
List<String> conceptIds = Arrays.asList("conceptIds_example"); // List<String> | concept id
String domainId = "domainId_example"; // String | domain id
try {
    ConceptAnalysisListResponse result = apiInstance.getConceptAnalysisResults(conceptIds, domainId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getConceptAnalysisResults");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **conceptIds** | [**List&lt;String&gt;**](String.md)| concept id |
 **domainId** | **String**| domain id | [optional]

### Return type

[**ConceptAnalysisListResponse**](ConceptAnalysisListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getCountAnalysis"></a>
# **getCountAnalysis**
> CountAnalysis getCountAnalysis(domainId, domainDesc)



Gets EHR biological sex and age count analysis

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
String domainId = "domainId_example"; // String | domain id
String domainDesc = "domainDesc_example"; // String | domain desc
try {
    CountAnalysis result = apiInstance.getCountAnalysis(domainId, domainDesc);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getCountAnalysis");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **domainId** | **String**| domain id |
 **domainDesc** | **String**| domain desc |

### Return type

[**CountAnalysis**](CountAnalysis.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getCriteriaChildren"></a>
# **getCriteriaChildren**
> CriteriaListResponse getCriteriaChildren(parentId)



Gets the children when parent concept is expanded in ui

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long parentId = 789L; // Long | parent id
try {
    CriteriaListResponse result = apiInstance.getCriteriaChildren(parentId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getCriteriaChildren");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **parentId** | **Long**| parent id |

### Return type

[**CriteriaListResponse**](CriteriaListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getCriteriaRolledCounts"></a>
# **getCriteriaRolledCounts**
> CriteriaParentResponse getCriteriaRolledCounts(conceptId, domain)



Gets the rolled up count from criteria

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long conceptId = 789L; // Long | parent concept id
String domain = "domain_example"; // String | parent concept domain
try {
    CriteriaParentResponse result = apiInstance.getCriteriaRolledCounts(conceptId, domain);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getCriteriaRolledCounts");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **conceptId** | **Long**| parent concept id |
 **domain** | **String**| parent concept domain |

### Return type

[**CriteriaParentResponse**](CriteriaParentResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getDomainTotals"></a>
# **getDomainTotals**
> DomainInfosAndSurveyModulesResponse getDomainTotals(searchWord, testFilter, orderFilter)



Gets the domain filters and survey modules with the count of all concepts and questions

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
String searchWord = "searchWord_example"; // String | search key word
Integer testFilter = 56; // Integer | measurement filter
Integer orderFilter = 56; // Integer | measurement filter
try {
    DomainInfosAndSurveyModulesResponse result = apiInstance.getDomainTotals(searchWord, testFilter, orderFilter);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getDomainTotals");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **searchWord** | **String**| search key word | [optional]
 **testFilter** | **Integer**| measurement filter | [optional]
 **orderFilter** | **Integer**| measurement filter | [optional]

### Return type

[**DomainInfosAndSurveyModulesResponse**](DomainInfosAndSurveyModulesResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getFMHQuestions"></a>
# **getFMHQuestions**
> SurveyQuestionFetchResponse getFMHQuestions(surveyConceptId, questionConceptIds, searchWord)



Get survey questions

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long surveyConceptId = 789L; // Long | survey concept id
List<String> questionConceptIds = Arrays.asList("questionConceptIds_example"); // List<String> | concept id
String searchWord = "searchWord_example"; // String | search word
try {
    SurveyQuestionFetchResponse result = apiInstance.getFMHQuestions(surveyConceptId, questionConceptIds, searchWord);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getFMHQuestions");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **surveyConceptId** | **Long**| survey concept id |
 **questionConceptIds** | [**List&lt;String&gt;**](String.md)| concept id | [optional]
 **searchWord** | **String**| search word | [optional]

### Return type

[**SurveyQuestionFetchResponse**](SurveyQuestionFetchResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getFMHSurveyQuestionResults"></a>
# **getFMHSurveyQuestionResults**
> QuestionConceptListResponse getFMHSurveyQuestionResults(questionConceptId, answerConceptId)



Get the results &amp; sub questions with results for fmh condition / family member group

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
String questionConceptId = "questionConceptId_example"; // String | question concept id
String answerConceptId = "answerConceptId_example"; // String | answer concept id
try {
    QuestionConceptListResponse result = apiInstance.getFMHSurveyQuestionResults(questionConceptId, answerConceptId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getFMHSurveyQuestionResults");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **questionConceptId** | **String**| question concept id |
 **answerConceptId** | **String**| answer concept id |

### Return type

[**QuestionConceptListResponse**](QuestionConceptListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getFitbitAnalysisResults"></a>
# **getFitbitAnalysisResults**
> ConceptAnalysisListResponse getFitbitAnalysisResults(conceptNames)



Gets analysis results of fitbit

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
List<String> conceptNames = Arrays.asList("conceptNames_example"); // List<String> | concept name
try {
    ConceptAnalysisListResponse result = apiInstance.getFitbitAnalysisResults(conceptNames);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getFitbitAnalysisResults");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **conceptNames** | [**List&lt;String&gt;**](String.md)| concept name |

### Return type

[**ConceptAnalysisListResponse**](ConceptAnalysisListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getGenderAnalysis"></a>
# **getGenderAnalysis**
> Analysis getGenderAnalysis()



Gets results for an analysis id

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
try {
    Analysis result = apiInstance.getGenderAnalysis();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getGenderAnalysis");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**Analysis**](Analysis.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getParticipantCount"></a>
# **getParticipantCount**
> AchillesResult getParticipantCount()



Gets results for an analysis id and stratum

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
try {
    AchillesResult result = apiInstance.getParticipantCount();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getParticipantCount");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AchillesResult**](AchillesResult.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSourceConcepts"></a>
# **getSourceConcepts**
> ConceptListResponse getSourceConcepts(conceptId, minCount)



Get children of the given concept

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long conceptId = 789L; // Long | concept id to get maps to concepts
Integer minCount = 56; // Integer | minimum source count
try {
    ConceptListResponse result = apiInstance.getSourceConcepts(conceptId, minCount);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getSourceConcepts");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **conceptId** | **Long**| concept id to get maps to concepts |
 **minCount** | **Integer**| minimum source count | [optional]

### Return type

[**ConceptListResponse**](ConceptListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSubQuestions"></a>
# **getSubQuestions**
> SurveyQuestionFetchResponse getSubQuestions(surveyConceptId, questionConceptId, answerConceptId, level)



Get survey sub questions

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long surveyConceptId = 789L; // Long | survey concept id
Long questionConceptId = 789L; // Long | question concept id
Long answerConceptId = 789L; // Long | answer concept id
Integer level = 56; // Integer | sub question level
try {
    SurveyQuestionFetchResponse result = apiInstance.getSubQuestions(surveyConceptId, questionConceptId, answerConceptId, level);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getSubQuestions");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **surveyConceptId** | **Long**| survey concept id |
 **questionConceptId** | **Long**| question concept id |
 **answerConceptId** | **Long**| answer concept id |
 **level** | **Integer**| sub question level |

### Return type

[**SurveyQuestionFetchResponse**](SurveyQuestionFetchResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSurveyQuestionCounts"></a>
# **getSurveyQuestionCounts**
> AnalysisListResponse getSurveyQuestionCounts(questionConceptId, questionPath)



Gets participant count of question by each stratum

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
String questionConceptId = "questionConceptId_example"; // String | 
String questionPath = "questionPath_example"; // String | 
try {
    AnalysisListResponse result = apiInstance.getSurveyQuestionCounts(questionConceptId, questionPath);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getSurveyQuestionCounts");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **questionConceptId** | **String**|  |
 **questionPath** | **String**|  |

### Return type

[**AnalysisListResponse**](AnalysisListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSurveyQuestionResults"></a>
# **getSurveyQuestionResults**
> AnalysisListResponse getSurveyQuestionResults(surveyConceptId, questionConceptId, questionPath)



Get Survey Question Results

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long surveyConceptId = 789L; // Long | survey concept id
Long questionConceptId = 789L; // Long | question concept id
String questionPath = "questionPath_example"; // String | question path
try {
    AnalysisListResponse result = apiInstance.getSurveyQuestionResults(surveyConceptId, questionConceptId, questionPath);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getSurveyQuestionResults");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **surveyConceptId** | **Long**| survey concept id |
 **questionConceptId** | **Long**| question concept id |
 **questionPath** | **String**| question path | [optional]

### Return type

[**AnalysisListResponse**](AnalysisListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSurveyQuestions"></a>
# **getSurveyQuestions**
> SurveyQuestionFetchResponse getSurveyQuestions(surveyConceptId, searchWord)



Get survey questions

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long surveyConceptId = 789L; // Long | survey concept id
String searchWord = "searchWord_example"; // String | search word in surveys page
try {
    SurveyQuestionFetchResponse result = apiInstance.getSurveyQuestions(surveyConceptId, searchWord);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getSurveyQuestions");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **surveyConceptId** | **Long**| survey concept id |
 **searchWord** | **String**| search word in surveys page | [optional]

### Return type

[**SurveyQuestionFetchResponse**](SurveyQuestionFetchResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="getSurveyVersionCounts"></a>
# **getSurveyVersionCounts**
> SurveyVersionCountResponse getSurveyVersionCounts(surveyConceptId)



Get Survey Version Counts

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
Long surveyConceptId = 789L; // Long | survey concept id
try {
    SurveyVersionCountResponse result = apiInstance.getSurveyVersionCounts(surveyConceptId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#getSurveyVersionCounts");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **surveyConceptId** | **Long**| survey concept id |

### Return type

[**SurveyVersionCountResponse**](SurveyVersionCountResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="searchConcepts"></a>
# **searchConcepts**
> ConceptListResponse searchConcepts(request)



Gets list of matched concepts

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

DataBrowserApi apiInstance = new DataBrowserApi();
SearchConceptsRequest request = new SearchConceptsRequest(); // SearchConceptsRequest | search concept request
try {
    ConceptListResponse result = apiInstance.searchConcepts(request);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DataBrowserApi#searchConcepts");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **request** | [**SearchConceptsRequest**](SearchConceptsRequest.md)| search concept request | [optional]

### Return type

[**ConceptListResponse**](ConceptListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

