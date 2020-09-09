package org.pmiops.workbench.google;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpResponse;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.api.client.util.GenericData;
import com.google.api.client.http.*;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.jackson2.JacksonFactory;
import java.security.interfaces.RSAPrivateKey;
import com.auth0.jwt.JWT;
import java.io.IOException;
import java.util.*;
import org.springframework.stereotype.Component;
import java.io.FileInputStream;
import org.springframework.util.ResourceUtils;
import java.io.File;
import org.springframework.boot.web.client.RestTemplateCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ResourceLoader;
import java.io.FileNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class IAPAuthService {

    private static final String IAM_SCOPE = "https://www.googleapis.com/auth/iam";
    private static final String OAUTH_TOKEN_URI = "https://www.googleapis.com/oauth2/v4/token";
    private static final String JWT_BEARER_TOKEN_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer";
    private static final long EXPIRATION_TIME_IN_MILLIS = 3600 * 1000L;
    private static final HttpTransport httpTransport = new NetHttpTransport();

    private final String clientId;
    private final ServiceAccountCredentials credentials;
    private DecodedJWT googleJwt;
    private String token;

    @Autowired
    ResourceLoader resourceLoader;

    public IAPAuthService() throws IOException {
        this.clientId = "238501349883-965gu9qminos5dfcpusi43eokvd5i3io.apps.googleusercontent.com";
        this.credentials = getCredentials();
        synchronized (this) {
            if (googleJwt == null || googleJwt.getExpiresAt().before(new Date())) {
                googleJwt = getGoogleIdToken();
            }
            token = googleJwt.getToken();
        }
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    private ServiceAccountCredentials getCredentials() throws IOException {
        GoogleCredentials credentials = GoogleCredentials.getApplicationDefault().createScoped(Collections.singleton(IAM_SCOPE));
        return (ServiceAccountCredentials) credentials;
    }

    private DecodedJWT getGoogleIdToken() throws IOException {
        String jwt = getSignedJwt();
        final GenericData tokenRequest = new GenericData()
                .set("grant_type", JWT_BEARER_TOKEN_GRANT_TYPE)
                .set("assertion", jwt);
        final UrlEncodedContent content = new UrlEncodedContent(tokenRequest);

        final HttpRequestFactory requestFactory = httpTransport.createRequestFactory();

        final HttpRequest request = requestFactory
                .buildPostRequest(new GenericUrl(OAUTH_TOKEN_URI), content)
                .setParser(new JsonObjectParser(JacksonFactory.getDefaultInstance()));

        HttpResponse response = request.execute();
        GenericData responseData = response.parseAs(GenericData.class);
        String idToken = (String) responseData.get("id_token");
        return JWT.decode(idToken);
    }

    private String getSignedJwt() {
        long now = System.currentTimeMillis();
        RSAPrivateKey privateKey = (RSAPrivateKey) credentials.getPrivateKey();
        Algorithm algorithm = Algorithm.RSA256(null, privateKey);
        return JWT.create()
                .withKeyId(credentials.getPrivateKeyId())
                .withIssuer(credentials.getClientEmail())
                .withSubject(credentials.getClientEmail())
                .withAudience(OAUTH_TOKEN_URI)
                .withIssuedAt(new Date(now))
                .withExpiresAt(new Date(now + EXPIRATION_TIME_IN_MILLIS))
                .withClaim("target_audience", clientId)
                .sign(algorithm);
    }
}
