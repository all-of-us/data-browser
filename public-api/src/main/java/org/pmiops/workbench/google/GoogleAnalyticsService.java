package org.pmiops.workbench.google;

import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.common.annotations.VisibleForTesting;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Generic service class that can be used to send server-side events to GA for processing.
 * See https://cloud.google.com/appengine/docs/standard/java/google-analytics for the source
 * of most of this code.
 */
public interface GoogleAnalyticsService {

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
    int trackEventToGoogleAnalytics(
            String category, String action, String label, String value) throws IOException;

    @VisibleForTesting
    URL getGoogleAnalyticsEndpoint() throws MalformedURLException;

    @VisibleForTesting
    void setUrlFetchService(URLFetchService fetchService);

}
