package org.pmiops.workbench.google;

import com.google.appengine.api.urlfetch.HTTPHeader;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.repackaged.com.google.common.base.Preconditions;
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

/**
 * Service class that can be used to send server-side events to GA for processing.
 * See https://cloud.google.com/appengine/docs/standard/java/google-analytics for the source
 * of most of this code.
 */
@Service
public class GoogleAnalyticsServiceImpl implements GoogleAnalyticsService {

    private final HTTPHeader header =
            new HTTPHeader("Content-Type", "application/x-www-form-urlencoded");
    private URLFetchService urlFetchService;
    private final Provider<WorkbenchConfig> configProvider;

    @Autowired
    public GoogleAnalyticsServiceImpl(Provider<WorkbenchConfig> configProvider, URLFetchService urlFetchService) {
        this.configProvider = configProvider;
        this.urlFetchService = urlFetchService;
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
        try {
            Preconditions.checkNotNull(category);
            Preconditions.checkNotNull(action);
        } catch (NullPointerException e) {
            throw new IllegalArgumentException("category and action are required values");
        }

        Map<String, String> map = new LinkedHashMap<>();
        map.put("v", "1");             // Version.
        map.put("tid", configProvider.get().server.gaId);
        map.put("cid", configProvider.get().server.clientId);
        map.put("t", "event");         // Event hit type.
        map.put("ec", encode(category));
        map.put("ea", encode(action));
        map.put("el", encode(label));
        map.put("ev", encode(value));

        HTTPRequest request = new HTTPRequest(getGoogleAnalyticsEndpoint(), HTTPMethod.POST);
        request.addHeader(this.header);
        request.setPayload(getPostData(map));

        HTTPResponse httpResponse = urlFetchService.fetch(request);
        return httpResponse.getResponseCode();
    }

    private URL getGoogleAnalyticsEndpoint() throws MalformedURLException {
        return new URL("http", "www.google-analytics.com", "/collect");
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

    private static String encode(String value) throws UnsupportedEncodingException {
        if (value == null) {
            return "";
        }
        return URLEncoder.encode(value, StandardCharsets.UTF_8.name());
    }

}
