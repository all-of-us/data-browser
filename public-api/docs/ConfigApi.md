# ConfigApi

All URIs are relative to *https://public-api.pmi-ops.org*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getConfig**](ConfigApi.md#getConfig) | **GET** /v1/config | 


<a name="getConfig"></a>
# **getConfig**
> ConfigResponse getConfig()



Returns some server configuration data.

### Example
```java
// Import classes:
//import org.pmiops.workbench.publicapi.client.ApiException;
//import org.pmiops.workbench.publicapi.client.api.ConfigApi;


ConfigApi apiInstance = new ConfigApi();
try {
    ConfigResponse result = apiInstance.getConfig();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ConfigApi#getConfig");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ConfigResponse**](ConfigResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

