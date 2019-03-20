package org.pmiops.workbench.google;

import com.google.appengine.api.urlfetch.HTTPHeader;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.common.annotations.VisibleForTesting;
import org.pmiops.workbench.config.WorkbenchConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.inject.Provider;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class GoogleAnalyticsServiceImpl implements GoogleAnalyticsService {

    private final HTTPHeader header =
            new HTTPHeader("Content-Type", "application/x-www-form-urlencoded");
    private URLFetchService urlFetchService;
    private final Provider<WorkbenchConfig> configProvider;

    @Autowired
    public GoogleAnalyticsServiceImpl(Provider<WorkbenchConfig> configProvider) {
        this.configProvider = configProvider;
        setUrlFetchService(getUrlFetchService());
    }

    /**
     * Posts an Event Tracking message to Google Analytics.
     * See https://developers.google.com/analytics/devguides/collection/gtagjs/events
     * for a list of default GA events.
     *
     * @param category the required event category, e.g. 'engagement'
     * @param action the required event action, e.g. 'search'
     * @param label the optional event label, e.g. 'search_term'
     * @param value the optional value, e.g. 'diabetes'
     * @return int value of the http response.
     * @exception IOException if the URL could not be posted to
     */
    public int trackEventToGoogleAnalytics(
            String category, String action, String label, String value) throws IOException {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("v", "1");             // Version.
        map.put("tid", configProvider.get().server.gaId);
        map.put("cid", configProvider.get().server.clientId);
        map.put("t", "event");         // Event hit type.
        map.put("ec", encode(category, true));
        map.put("ea", encode(action, true));
        map.put("el", encode(label, false));
        map.put("ev", encode(value, false));

        HTTPRequest request = new HTTPRequest(getGoogleAnalyticsEndpoint(), HTTPMethod.POST);
        request.addHeader(this.header);
        request.setPayload(getPostData(map));

        HTTPResponse httpResponse = urlFetchService.fetch(request);
        return httpResponse.getResponseCode();
    }

    @VisibleForTesting
    public URL getGoogleAnalyticsEndpoint() throws MalformedURLException {
        return new URL("http", "www.google-analytics.com", "/collect");
    }

    @VisibleForTesting
    public void setUrlFetchService(URLFetchService fetchService) {
        this.urlFetchService = fetchService;
    }

    private URLFetchService getUrlFetchService() {
        return URLFetchServiceFactory.getURLFetchService();
    }

    private static byte[] getPostData(Map<String, String> map) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : map.entrySet()) {
            sb.append(entry.getKey());
            sb.append('=');
            sb.append(entry.getValue());
            sb.append('&');
        }
        if (sb.length() > 0) {
            sb.setLength(sb.length() - 1); // Remove the trailing &.
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String encode(String value, boolean required)
            throws UnsupportedEncodingException {
        if (value == null) {
            if (required) {
                throw new IllegalArgumentException("Required parameter not set.");
            }
            return "";
        }
        return URLEncoder.encode(value, StandardCharsets.UTF_8.name());
    }
}
