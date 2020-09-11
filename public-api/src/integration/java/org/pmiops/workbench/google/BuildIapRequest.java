package org.pmiops.workbench.google;

import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.IdTokenCredentials;
import com.google.auth.oauth2.IdTokenProvider;
import com.google.common.base.Preconditions;
import java.io.IOException;
import java.util.*;

/**
 Class that can be used to get OIDC token for a service account.
 https://cloud.google.com/iap/docs/authentication-howto#iap_make_request-java
 */
public class BuildIapRequest {
    private static final String IAM_SCOPE = "https://www.googleapis.com/auth/iam";

    public BuildIapRequest() throws IOException {
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
    public static String buildIapRequest(String iapClientId)
            throws IOException {

        IdTokenProvider idTokenProvider = getIdTokenProvider();
        IdTokenCredentials tokenCredential = IdTokenCredentials.newBuilder()
            .setIdTokenProvider(idTokenProvider)
            .setTargetAudience(iapClientId).build();
        tokenCredential.refresh();
        return tokenCredential.getIdToken().getTokenValue();
    }
}