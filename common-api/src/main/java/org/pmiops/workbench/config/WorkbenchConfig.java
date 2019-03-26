package org.pmiops.workbench.config;

/**
 * A class representing the main workbench configuration; parsed from JSON stored in the database.
 * See {@link CacheSpringConfiguration}. This should be kept in sync with files in the config/ directory.
 */
public class WorkbenchConfig {

  public AuthConfig auth;
  public ServerConfig server;

  public static class AuthConfig {
    public Boolean enforceRegistered;
    public Boolean requireSignIn;
    public String gsuiteDomain;
  }

  public static class ServerConfig {
    public Boolean debugEndpoints;
    public String workbenchApiBaseUrl;
    public String publicApiKeyForErrorReports;
    public String projectId;
    public String gaId;
  }
}
