package org.pmiops.workbench.publicapi;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rejects requests to /v1/genomics/* that do not originate from a known first-party UI.
 *
 * <p>Motivation: a scraper hitting genomics endpoints ran up a ~$20k BigQuery bill in April 2026.
 * The endpoints are only meant to be called from the Data Browser web UI, so we reject any request
 * whose Origin (or, if absent, Referer) is not on the allow-list below. OPTIONS preflights are
 * always allowed through so CORS still works.
 */
@Component
@Order(0)
public class OriginCheckFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(OriginCheckFilter.class);

  private static final String PROTECTED_PREFIX = "/v1/genomics/";

  private static final Set<String> ALLOWED_ORIGINS =
      Set.of(
          "https://databrowser.researchallofus.org",
          "https://aou-db-test.appspot.com",
          "https://databrowser.staging.fake-research-aou.org",
          "https://databrowser.stable.fake-research-aou.org",
          "http://localhost:4200");

  private static final String FORBIDDEN_BODY = "{\"error\":\"forbidden\",\"reason\":\"invalid_origin\"}";

  private final boolean enabled;

  public OriginCheckFilter(@Value("${originCheck.enabled:true}") boolean enabled) {
    this.enabled = enabled;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if (!enabled) {
      return true;
    }
    String path = request.getRequestURI();
    return path == null || !path.startsWith(PROTECTED_PREFIX);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    if (HttpMethod.OPTIONS.matches(request.getMethod())) {
      chain.doFilter(request, response);
      return;
    }

    String origin = trimToNull(request.getHeader(HttpHeaders.ORIGIN));
    String referer = trimToNull(request.getHeader(HttpHeaders.REFERER));

    if (isAllowed(origin, referer)) {
      chain.doFilter(request, response);
      return;
    }

    logRejection(request, origin, referer);
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write(FORBIDDEN_BODY);
  }

  private static boolean isAllowed(String origin, String referer) {
    if (origin != null) {
      return ALLOWED_ORIGINS.contains(origin);
    }
    if (referer == null) {
      return false;
    }
    for (String allowed : ALLOWED_ORIGINS) {
      if (referer.equals(allowed) || referer.startsWith(allowed + "/")) {
        return true;
      }
    }
    return false;
  }

  private static String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private void logRejection(HttpServletRequest request, String origin, String referer) {
    log.warn(
        "OriginCheckFilter rejected request clientIp={} path={} userAgent={} origin={} referer={}",
        sanitize(clientIp(request)),
        sanitize(request.getRequestURI()),
        sanitize(request.getHeader(HttpHeaders.USER_AGENT)),
        sanitize(origin),
        sanitize(referer));
  }

  private static String clientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      int comma = forwarded.indexOf(',');
      String first = comma >= 0 ? forwarded.substring(0, comma) : forwarded;
      String trimmed = first.trim();
      if (!trimmed.isEmpty()) {
        return trimmed;
      }
    }
    return request.getRemoteAddr();
  }

  /** Strips CR/LF and quote characters to prevent log-forging via header values. */
  private static String sanitize(String value) {
    if (value == null) {
      return null;
    }
    return value.replaceAll("[\\r\\n\"']", "");
  }
}
