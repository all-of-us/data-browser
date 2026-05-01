package org.pmiops.workbench.publicapi;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
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
 * Logs (and optionally rejects) requests to /v1/genomics/* whose Origin/Referer is not on the
 * first-party allow-list.
 *
 *
 * Modes (controlled by {@code originCheck.mode}):
 * {@code off} — filter does nothing.
 *   <li>{@code log} (default) — log requests with unknown origin, allow them through.
 *   <li>{@code enforce} — reject requests with unknown origin (legacy behavior).
 * </ul>
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

  private static final String FORBIDDEN_BODY =
          "{\"error\":\"forbidden\",\"reason\":\"invalid_origin\"}";

  enum Mode {
    OFF,
    LOG,
    ENFORCE;

    static Mode parse(String raw) {
      if (raw == null) {
        return LOG;
      }
      switch (raw.trim().toLowerCase()) {
        case "off":
          return OFF;
        case "enforce":
          return ENFORCE;
        case "log":
        default:
          return LOG;
      }
    }
  }

  private final Mode mode;

  public OriginCheckFilter(@Value("${originCheck.mode:log}") String modeProperty) {
    this.mode = Mode.parse(modeProperty);
    log.info("OriginCheckFilter initialized in mode={}", this.mode);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if (mode == Mode.OFF) {
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

    if (mode == Mode.ENFORCE) {
      logUnknownOrigin(request, origin, referer, "rejected");
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write(FORBIDDEN_BODY);
      return;
    }

    // LOG mode: record the unknown-origin request and let it through.
    logUnknownOrigin(request, origin, referer, "allowed");
    chain.doFilter(request, response);
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

  private void logUnknownOrigin(
          HttpServletRequest request, String origin, String referer, String disposition) {
    log.warn(
            "OriginCheckFilter unknown-origin disposition={} clientIp={} path={} userAgent={} "
                    + "origin={} referer={}",
            disposition,
            sanitize(clientIp(request)),
            sanitize(request.getRequestURI()),
            sanitize(request.getHeader(HttpHeaders.USER_AGENT)),
            sanitize(origin),
            sanitize(referer));
  }

  static String clientIp(HttpServletRequest request) {
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
  static String sanitize(String value) {
    if (value == null) {
      return null;
    }
    return value.replaceAll("[\\r\\n\"']", "");
  }
}