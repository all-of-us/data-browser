# CdrVersionsApi

All URIs are relative to *https://public-api.pmi-ops.org*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getCdrVersions**](CdrVersionsApi.md#getCdrVersions) | **GET** /v1/cdrVersions | 


<a name="getCdrVersions"></a>
# **getCdrVersions**
> CdrVersionListResponse getCdrVersions()



Returns all curated data repository (CDR) versions that the user has access to

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiClient;
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.Configuration;
//import org.pmiops.workbench.publicapi.client.auth.*;
//import org.pmiops.workbench.publicapi.client.api.CdrVersionsApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

CdrVersionsApi apiInstance = new CdrVersionsApi();
try {
    CdrVersionListResponse result = apiInstance.getCdrVersions();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling CdrVersionsApi#getCdrVersions");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CdrVersionListResponse**](CdrVersionListResponse.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

