package org.pmiops.workbench.publicapi;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Per-IP token-bucket rate limiter for the genomics public API.
 *
 *   Token bucket: {@code refillPerMinute} tokens added per minute, capped at {@code burst}.
 *       Each request consumes one token. No tokens => 429.
 *   Storage is an in-memory {@link ConcurrentHashMap} keyed by client IP. This means limits
 *       are per-instance, not global — a multi-instance deployment effectively multiplies the
 *       limit by instance count. That is acceptable as a first-line defense; Cloud Armor or a
 *       Redis-backed limiter would be the next step if global enforcement becomes necessary.
 *   Stale buckets are evicted opportunistically on writes (every {@code CLEANUP_EVERY_N}
 *       distinct keys touched), so the map can't grow unbounded.
 *   OPTIONS preflights and a configurable allow-list of IPs are exempt.
 *
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private static final String PROTECTED_PREFIX = "/v1/genomics/";
    private static final String TOO_MANY_BODY =
            "{\"error\":\"too_many_requests\",\"reason\":\"rate_limited\"}";
    private static final int CLEANUP_EVERY_N = 256;
    private static final long STALE_BUCKET_MS = 10 * 60 * 1000L; // 10 minutes idle => evict

    private final boolean enabled;
    private final double refillTokensPerMs;
    private final double burstCapacity;
    private final Set<String> exemptIps;

    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    private int writesSinceCleanup = 0;

    public RateLimitFilter(
            @Value("${rateLimit.enabled:true}") boolean enabled,
            @Value("${rateLimit.refillPerMinute:60}") int refillPerMinute,
            @Value("${rateLimit.burst:30}") int burst,
            @Value("${rateLimit.exemptIps:}") String exemptIpsCsv) {
        this.enabled = enabled;
        this.refillTokensPerMs = refillPerMinute / 60_000.0;
        this.burstCapacity = Math.max(burst, 1);
        this.exemptIps = parseCsv(exemptIpsCsv);
        log.info(
                "RateLimitFilter initialized enabled={} refillPerMinute={} burst={} exemptIps={}",
                enabled,
                refillPerMinute,
                burst,
                this.exemptIps);
    }

    private static Set<String> parseCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            return Set.of();
        }
        String[] parts = csv.split(",");
        java.util.HashSet<String> out = new java.util.HashSet<>();
        for (String p : parts) {
            String t = p.trim();
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return Set.copyOf(out);
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

        String ip = OriginCheckFilter.clientIp(request);
        if (ip == null || ip.isBlank()) {
            // Can't key without an IP — fail open; OriginCheckFilter logging will still record it.
            chain.doFilter(request, response);
            return;
        }

        if (exemptIps.contains(ip)) {
            chain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();
        TokenBucket bucket =
                buckets.computeIfAbsent(ip, k -> new TokenBucket(burstCapacity, now));
        boolean allowed = bucket.tryConsume(now, refillTokensPerMs, burstCapacity);

        maybeCleanup(now);

        if (allowed) {
            chain.doFilter(request, response);
            return;
        }

        long retryAfterSec = (long) Math.ceil(1.0 / (refillTokensPerMs * 1000.0));
        log.warn(
                "RateLimitFilter rejected clientIp={} path={} userAgent={}",
                OriginCheckFilter.sanitize(ip),
                OriginCheckFilter.sanitize(request.getRequestURI()),
                OriginCheckFilter.sanitize(request.getHeader("User-Agent")));
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", Long.toString(retryAfterSec));
        response.getWriter().write(TOO_MANY_BODY);
    }

    /**
     * Opportunistic eviction of buckets that haven't been touched in {@link #STALE_BUCKET_MS}.
     * Runs every {@link #CLEANUP_EVERY_N} writes. Synchronized so only one thread sweeps at a time;
     * other threads skip cleanup on this call.
     */
    private void maybeCleanup(long now) {
        int n;
        synchronized (this) {
            n = ++writesSinceCleanup;
            if (n < CLEANUP_EVERY_N) {
                return;
            }
            writesSinceCleanup = 0;
        }
        Iterator<Map.Entry<String, TokenBucket>> it = buckets.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, TokenBucket> entry = it.next();
            if (now - entry.getValue().lastRefillMs() > STALE_BUCKET_MS) {
                it.remove();
            }
        }
    }

    /** Simple token bucket. Methods are synchronized on the instance — contention per IP only. */
    private static final class TokenBucket {
        private double tokens;
        private long lastRefillMs;

        TokenBucket(double initialTokens, long nowMs) {
            this.tokens = initialTokens;
            this.lastRefillMs = nowMs;
        }

        synchronized boolean tryConsume(long nowMs, double refillPerMs, double capacity) {
            long elapsed = nowMs - lastRefillMs;
            if (elapsed > 0) {
                tokens = Math.min(capacity, tokens + elapsed * refillPerMs);
                lastRefillMs = nowMs;
            }
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        synchronized long lastRefillMs() {
            return lastRefillMs;
        }
    }
}