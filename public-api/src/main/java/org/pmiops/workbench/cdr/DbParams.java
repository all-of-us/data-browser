package org.pmiops.workbench.cdr;

import java.util.logging.Logger;
import org.pmiops.workbench.db.Params;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DbParams extends Params {
    private static final Logger log = Logger.getLogger(DbParams.class.getName());

    @Override
    public void loadFromEnvironment() {
        hostname = getEnv("PUBLIC_DB_HOST").orElse(null);
        cloudSqlInstanceName = getEnv("PUBLIC_CLOUD_SQL_INSTANCE_NAME").orElse(null);
        password = getEnv("PUBLIC_DB_PASSWORD").orElse(null);
        try {
            validate();
            log.info("PUBLIC SQL instance params: " + this.toString());
        } catch (IllegalStateException e) {
            super.loadFromEnvironment();
            log.info("PUBLIC SQL instance params: [Databrowser instance params]");
        }
    }

    protected void logParams() {
        // Logged above.
    }
}