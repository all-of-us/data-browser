package org.pmiops.workbench.publicapi;

import static com.google.common.truth.Truth.assertThat;

import com.google.common.collect.ImmutableList;
import java.util.List;
import java.util.stream.Collectors;
import org.assertj.core.util.Strings;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.pmiops.workbench.publicapi.client.ApiClient;
import org.pmiops.workbench.publicapi.client.api.DataBrowserApi;
import org.pmiops.workbench.publicapi.client.model.AchillesResult;
import org.pmiops.workbench.publicapi.client.model.Analysis;
import org.pmiops.workbench.publicapi.client.model.Concept;
import org.pmiops.workbench.publicapi.client.model.ConceptAnalysis;
import org.pmiops.workbench.publicapi.client.model.ConceptListResponse;
import org.pmiops.workbench.publicapi.client.model.Domain;
import org.pmiops.workbench.publicapi.client.model.DomainInfosAndSurveyModulesResponse;
import org.pmiops.workbench.publicapi.client.model.SearchConceptsRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.junit4.SpringRunner;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Date;
import org.springframework.util.ResourceUtils;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.security.interfaces.RSAPrivateKey;
import java.security.PrivateKey;
import com.auth0.jwt.JWT;
import com.google.api.client.util.GenericData;
import com.google.api.client.http.UrlEncodedContent;
import com.google.api.client.http.HttpRequestFactory;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpResponse;
import com.google.api.client.http.apache.ApacheHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.http.GenericUrl;

/**
 * Integration smoke tests for the Data Browser API - intended to run against a live instances of
 * the Data Browser API. These tests should be relatively unspecific, as they must run across
 * different CDR versions.
 */
@RunWith(SpringRunner.class)
public class DataBrowserControllerIntegrationTest {

  public static String DB_API_BASE_PATH = "DB_API_BASE_PATH";

  @TestConfiguration
  static class Configuration {
    @Bean
    DataBrowserApi client() {
      DataBrowserApi api = new DataBrowserApi();

      String basePath = System.getenv(DB_API_BASE_PATH);
      String signedJwt = getSignedJwt();
      if (Strings.isNullOrEmpty(basePath)) {
        throw new RuntimeException("Required env var '" + DB_API_BASE_PATH + "' not defined");
      }
      ApiClient apiClient = new ApiClient();
      apiClient.setBasePath(basePath);
      apiClient.setAccessToken(signedJwt);
      apiClient.setDebugging(true);
      api.setApiClient(apiClient);
      return api;
    }
  }

  public static String getSignedJwt() {
    String signedJwt = "";

    try {
      GoogleCredential credential = GoogleCredential.fromStream(new FileInputStream(ResourceUtils.getFile("classpath:test-circle-key.json")));
      PrivateKey privateKey = credential.getServiceAccountPrivateKey();
      String privateKeyId = credential.getServiceAccountPrivateKeyId();

      long now = System.currentTimeMillis();

      RSAPrivateKey rsaPrivateKey = (RSAPrivateKey) privateKey;
      Algorithm algorithm = Algorithm.RSA256(null, rsaPrivateKey);
      signedJwt = JWT.create()
              .withKeyId(privateKeyId)
              .withIssuer("circle-deploy-account@aou-db-test.iam.gserviceaccount.com")
              .withSubject("circle-deploy-account@aou-db-test.iam.gserviceaccount.com")
              .withAudience("238501349883-965gu9qminos5dfcpusi43eokvd5i3io.apps.googleusercontent.com")
              .withIssuedAt(new Date(now))
              .withExpiresAt(new Date(now + 3600 * 1000L))
              .withClaim("target_audience", "238501349883-965gu9qminos5dfcpusi43eokvd5i3io.apps.googleusercontent.com")
              .sign(algorithm);
    } catch(IOException ie) {
      System.out.println("Credential file not found");
    }

    return signedJwt;
  }

  private DecodedJWT getGoogleIdToken() throws IOException {
    String jwt = getSignedJwt();
    final GenericData tokenRequest = new GenericData()
            .set("grant_type", "JWT_BEARER_TOKEN_GRANT_TYPE")
            .set("assertion", jwt);
    final UrlEncodedContent content = new UrlEncodedContent(tokenRequest);
    HttpTransport httpTransport = new ApacheHttpTransport();
    final HttpRequestFactory requestFactory = httpTransport.createRequestFactory();

    final HttpRequest request = requestFactory
            .buildPostRequest(new GenericUrl("https://iap.googleapis.com/v1/oauth/clientIds/238501349883-965gu9qminos5dfcpusi43eokvd5i3io.apps.googleusercontent.com:handleRedirect"), content)
            .setParser(new JsonObjectParser(JacksonFactory.getDefaultInstance()));

    HttpResponse response = request.execute();
    GenericData responseData = response.parseAs(GenericData.class);
    String idToken = (String) responseData.get("id_token");
    return JWT.decode(idToken);
  }

  @Autowired
  DataBrowserApi api;

  @Test
  public void testDomainTotals() throws Exception {
    DomainInfosAndSurveyModulesResponse resp = api.getDomainTotals("", 1, 1);
    assertThat(resp.getDomainInfos()).isNotEmpty();
    assertThat(resp.getSurveyModules()).isNotEmpty();
  }

  @Test
  public void testGenderCount() throws Exception {
    Analysis resp = api.getGenderAnalysis();
    assertThat(resp.getResults()).isNotEmpty();
  }

  @Test
  public void testParticipantCount() throws Exception {
    AchillesResult resp = api.getParticipantCount();
    assertThat(resp.getCountValue()).isGreaterThan(0L);
  }

  @Test
  public void testConceptAnalysisResults() throws Exception {
    // These concept IDs are hardcoded by the data browser in all environments, so they must exist.
    List<String> concepts = ImmutableList.of("903118", "903115", "903133");
    List<String> gotConcepts = api.getConceptAnalysisResults(concepts, null).getItems()
        .stream()
        .map(ConceptAnalysis::getConceptId).collect(Collectors.toList());
    assertThat(gotConcepts).containsExactlyElementsIn(concepts);
  }

  @Test
  public void testDomainSearch_smoke() throws Exception {
    DomainInfosAndSurveyModulesResponse resp = api.getDomainTotals("smoke", 1, 1);
    assertThat(resp.getDomainInfos()).isNotEmpty();
    assertThat(resp.getSurveyModules()).isNotEmpty();
  }

  @Test
  public void testSearchConcepts() throws Exception {
    int maxResults = 20;
    ConceptListResponse resp = api.searchConcepts(new SearchConceptsRequest()
        .domain(Domain.MEASUREMENT)
        .minCount(1)
        .maxResults(maxResults));
    assertThat(resp.getItems()).isNotEmpty();
    assertThat(resp.getItems().size()).isAtMost(maxResults);
    for (Concept c : resp.getItems()) {
      // TODO: Use consistent enums throughout the API.
      assertThat(c.getDomainId()).ignoringCase().isEqualTo(Domain.MEASUREMENT.toString());
    }
  }
}
