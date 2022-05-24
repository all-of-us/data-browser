package org.pmiops.workbench.tools;

import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.apache.ApacheHttpTransport;
import com.google.gson.Gson;
import org.pmiops.workbench.db.dao.ConfigDao;
import org.pmiops.workbench.db.model.Config;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.retry.backoff.BackOffPolicy;
import org.springframework.retry.backoff.ExponentialRandomBackOffPolicy;
import org.springframework.retry.backoff.Sleeper;
import org.springframework.retry.backoff.ThreadWaitSleeper;

/**
 * Contains Spring beans for dependencies which are different for classes run in the context of a
 * command-line tool versus a WebMVC request handler.
 *
 * <p>The main difference is that request-scoped dependencies cannot be used from a command-line
 * context.
 *
 * <p>IMPORTANT: This config should only be used in a database context. In order to implement a tool
 * which uses this config, that tool must be run with an active SQL server available, e.g. via Cloud
 * SQL Proxy.
 */
@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories({"org.pmiops.workbench.db.dao"})
@EntityScan("org.pmiops.workbench.db.model")
public class CommandLineToolConfig {
    /**
     * Returns the Apache HTTP transport. Compare to CommonConfig which returns the App Engine HTTP
     * transport.
     */
    @Bean
    HttpTransport httpTransport() {
        return new ApacheHttpTransport();
    }

    @Bean
    public Sleeper sleeper() {
        return new ThreadWaitSleeper();
    }

    @Bean
    public BackOffPolicy backOffPolicy(Sleeper sleeper) {
        // Defaults to 100ms initial interval, doubling each time, with some random multiplier.
        ExponentialRandomBackOffPolicy policy = new ExponentialRandomBackOffPolicy();
        // Set max interval of 20 seconds.
        policy.setMaxInterval(20000);
        policy.setSleeper(sleeper);
        return policy;
    }

    /**
     * Run a command line spring boot application. The provided configuration should provide a
     * CommandLineRunner bean. The rest of the configuration is applied as a child to the standard
     * CommandLineToolConfig context, which provides common database / service access. The child
     * relationship allows the CLI config class to override parent beans if needed.
     *
     * @param cliConfig the class which declares the CommandLineRunner and optionally other
     *     dependencies
     * @param args command line args to pass to the program
     */
    public static void runCommandLine(Class<?> cliConfig, String[] args) {
        new SpringApplicationBuilder(CommandLineToolConfig.class, cliConfig)
                .web(WebApplicationType.NONE)
                .run(args)
                .close();
    }
}