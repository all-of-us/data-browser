package org.pmiops.workbench.google;

import javax.annotation.Nullable;
import java.io.IOException;

public interface GoogleAnalyticsService {

    int trackEventToGoogleAnalytics(@Nullable String cid, String category, String action,
                                    String label, String value) throws IOException;

}
