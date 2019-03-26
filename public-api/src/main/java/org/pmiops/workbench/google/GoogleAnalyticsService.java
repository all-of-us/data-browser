package org.pmiops.workbench.google;

import java.io.IOException;

public interface GoogleAnalyticsService {

    int trackEventToGoogleAnalytics(
            String cid, String category, String action, String label, String value)
            throws NullPointerException, IOException;

}
