package org.pmiops.workbench.google;

import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.pmiops.workbench.Providers;
import org.pmiops.workbench.config.WorkbenchConfig;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
public class GoogleAnalyticsServiceTest {

    private static final String CATEGORY = "category";
    private static final String ACTION = "action";
    private static final String LABEL = "label";
    private static final String VALUE = "value";
    private static final int SUCCESS = 200;
    private static final int FAILURE = 500;
    private GoogleAnalyticsService trackingService;

    @Mock
    private URLFetchService fetchService;

    @Before
    public void setUp() {
        WorkbenchConfig config = new WorkbenchConfig();
        config.server = new WorkbenchConfig.ServerConfig();
        config.server.clientId = "testClientId";
        config.server.gaId = "testGaId";
        trackingService = new GoogleAnalyticsService(Providers.of(config));
        trackingService.setUrlFetchService(fetchService);
    }

    @Test
    public void testSuccessResponse() throws Exception {
        when(fetchService.fetch(any(HTTPRequest.class))).thenReturn(buildResponse(SUCCESS));
        int responseCode = trackingService
                .trackEventToGoogleAnalytics(CATEGORY, ACTION, LABEL, VALUE);
        assertThat(responseCode).isEqualTo(SUCCESS);
        verify(fetchService, times(1)).fetch(any(HTTPRequest.class));
    }

    @Test
    public void testFailureResponse() throws Exception {
        when(fetchService.fetch(any(HTTPRequest.class))).thenReturn(buildResponse(FAILURE));
        int responseCode = trackingService
                .trackEventToGoogleAnalytics(CATEGORY, ACTION, LABEL, VALUE);
        assertThat(responseCode).isEqualTo(FAILURE);
        verify(fetchService, times(1)).fetch(any(HTTPRequest.class));
    }

    @Test
    public void testRequiredParametersSuccess() throws Exception {
        when(fetchService.fetch(any(HTTPRequest.class))).thenReturn(buildResponse(SUCCESS));
        int responseCode = trackingService
                .trackEventToGoogleAnalytics(CATEGORY, ACTION, null, null);
        assertThat(responseCode).isEqualTo(SUCCESS);
        verify(fetchService, times(1)).fetch(any(HTTPRequest.class));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testRequiredParametersFailure() throws Exception {
        trackingService.trackEventToGoogleAnalytics(null, null, null, null);
        verify(fetchService, times(0)).fetch(any(HTTPRequest.class));
    }

    private HTTPResponse buildResponse(int responseCode) throws Exception {
        return new HTTPResponse(
                responseCode,
                "".getBytes(),
                trackingService.getGoogleAnalyticsEndpoint(),
                new ArrayList<>()
        );
    }

}
