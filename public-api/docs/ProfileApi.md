# ProfileApi

All URIs are relative to *https://api.pmi-ops.org*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getMe**](ProfileApi.md#getMe) | **GET** /v1/me | 


<a name="getMe"></a>
# **getMe**
> Profile getMe()



Returns the user&#39;s profile information

### Example
```java
// Import classes:
//import org.pmiops.workbench.privateworkbench.ApiClient;
//import org.pmiops.workbench.privateworkbench.ApiException;
//import org.pmiops.workbench.privateworkbench.Configuration;
//import org.pmiops.workbench.privateworkbench.auth.*;
//import org.pmiops.workbench.privateworkbench.api.ProfileApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure OAuth2 access token for authorization: aou_oauth
OAuth aou_oauth = (OAuth) defaultClient.getAuthentication("aou_oauth");
aou_oauth.setAccessToken("YOUR ACCESS TOKEN");

ProfileApi apiInstance = new ProfileApi();
try {
    Profile result = apiInstance.getMe();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ProfileApi#getMe");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**Profile**](Profile.md)

### Authorization

[aou_oauth](../README.md#aou_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

