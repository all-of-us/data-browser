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
import java.io.IOException;
import org.pmiops.workbench.google.BuildIapRequest;

/**
 * Integration smoke tests for the Data Browser API - intended to run against a live instances of
 * the Data Browser API. These tests should be relatively unspecific, as they must run across
 * different CDR versions.
 */
@RunWith(SpringRunner.class)
public class DataBrowserControllerIntegrationTest {

  public static String DB_API_BASE_PATH = "DB_API_BASE_PATH";
  // Staging client ID
  public static String CLIENT_ID = "238501349883-965gu9qminos5dfcpusi43eokvd5i3io.apps.googleusercontent.com";

  @TestConfiguration
  static class Configuration {
    @Bean
    DataBrowserApi client() {
      DataBrowserApi api = new DataBrowserApi();
      String basePath = System.getenv(DB_API_BASE_PATH);
      if (Strings.isNullOrEmpty(basePath)) {
        throw new RuntimeException("Required env var '" + DB_API_BASE_PATH + "' not defined");
      }
      ApiClient apiClient = new ApiClient();
      apiClient.setBasePath(basePath);
      if (basePath.contains("aou-db-staging")) {
        String token = "";
        try {
          BuildIapRequest buildRequest = new BuildIapRequest();
          token = buildRequest.buildIapRequest(CLIENT_ID);
        } catch (IOException ie) {
        }
        apiClient.setAccessToken(token.replace("Bearer ", ""));
      }
      api.setApiClient(apiClient);
      return api;
    }
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
