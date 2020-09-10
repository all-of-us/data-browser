package org.pmiops.workbench.google;

import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.IdTokenCredentials;
import com.google.auth.oauth2.IdTokenProvider;
import com.google.common.base.Preconditions;
import java.io.IOException;
import java.util.*;

public class BuildIapRequest {
    private static final String IAM_SCOPE = "https://www.googleapis.com/auth/iam";

    private static final HttpTransport httpTransport = new NetHttpTransport();

    private static String TOKEN = "";

    public BuildIapRequest(String clientId) throws IOException {
        buildIapRequest(clientId);
    }

    private static IdTokenProvider getIdTokenProvider() throws IOException {
        GoogleCredentials credentials =
                GoogleCredentials.getApplicationDefault().createScoped(Collections.singleton(IAM_SCOPE));

        Preconditions.checkNotNull(credentials, "Expected to load credentials");
        Preconditions.checkState(
                credentials instanceof IdTokenProvider,
                String.format(
                        "Expected credentials that can provide id tokens, got %s instead",
                        credentials.getClass().getName()));

        return (IdTokenProvider) credentials;
    }

    /**
     * Clone request and add an IAP Bearer Authorization header with signed JWT token.
     *
     * @param request Request to add authorization header
     * @param iapClientId OAuth 2.0 client ID for IAP protected resource
     * @return Clone of request with Bearer style authorization header with signed jwt token.
     * @throws IOException exception creating signed JWT
     */
    public static void buildIapRequest(String iapClientId)
            throws IOException {

        IdTokenProvider idTokenProvider = getIdTokenProvider();
        IdTokenCredentials tokenCredential = IdTokenCredentials.newBuilder()
            .setIdTokenProvider(idTokenProvider)
            .setTargetAudience(iapClientId).build();
        Map<String, List<String>> requestData = tokenCredential.getRequestMetadata();
        if (requestData.containsKey("Authorization")) {
            TOKEN = requestData.get("Authorization").get(0);
        }
    }

    public static String getToken() {
        return TOKEN;
    }
}