package org.pmiops.workbench.google;

import java.io.IOException;

public interface GoogleAnalyticsService {

    int trackEventToGoogleAnalytics(
            String category, String action, String label, String value) throws IOException;

}
