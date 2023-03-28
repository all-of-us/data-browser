package org.pmiops.workbench.cdr;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;
import javax.persistence.TypedQuery;
import javax.sql.DataSource;
import org.apache.tomcat.jdbc.pool.PoolConfiguration;
import org.apache.tomcat.jdbc.pool.PoolProperties;
import org.pmiops.workbench.db.dao.CdrVersionDao;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.stereotype.Service;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.pool.HikariPool;
import java.util.Optional;

@Service("cdrDataSource")
public class CdrDataSource extends AbstractRoutingDataSource {

    private static final Logger log = Logger.getLogger(CdrDataSource.class.getName());

    private final CdrVersionDao cdrVersionDao;

    private final PoolConfiguration basePoolConfig;
    private final PoolConfiguration cdrPoolConfig;
    private final EntityManagerFactory emFactory;

    CdrDataSource(
            CdrVersionDao cdrVersionDao,
            @Qualifier("poolConfiguration") PoolConfiguration basePoolConfig,
            @Qualifier("cdrPoolConfiguration") PoolConfiguration cdrPoolConfig,
            // Using CdrDbConfig.cdrEntityManagerFactory would cause a circular dependency.
            @Qualifier("entityManagerFactory") EntityManagerFactory emFactory) {
        this.cdrVersionDao = cdrVersionDao;
        this.basePoolConfig = basePoolConfig;
        this.cdrPoolConfig = cdrPoolConfig;
        this.emFactory = emFactory;
        resetTargetDataSources();
    }

    DataSource createDataSource(String dbName) {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setJdbcUrl(String.format("jdbc:mysql:///%s", dbName));
        config.setUsername(getRequiredEnv("PUBLIC_DB_USER"));
        config.setPassword(getRequiredEnv("PUBLIC_DB_PASSWORD"));
        config.addDataSourceProperty("socketFactory", "com.google.cloud.sql.mysql.SocketFactory");
        config.addDataSourceProperty("cloudSqlInstance", getRequiredEnv("CLOUD_SQL_INSTANCE"));
        config.addDataSourceProperty("useSSL", false);
        return new HikariDataSource(config);
    }

    String getRequiredEnv(String name) {
        return Optional.ofNullable(System.getenv(name)).map(s -> s.trim()).filter(s -> s != "")
                .orElseThrow(() -> new IllegalStateException(name + " not defined"));
    }

    void resetTargetDataSources() {
        String dbUser = getRequiredEnv("CDR_DB_USER");
        String dbPassword = getRequiredEnv("CDR_DB_PASSWORD");

        // Build a map of CDR version ID -> DataSource for use later, based on all the entries in the
        // cdr_version table. Note that if new CDR versions are inserted, we need to restart the
        // server in order for it to be used.
        // TODO: find a way to make sure CDR versions aren't shown in the UI until they are in use by
        // all servers.
        Map<Object, Object> cdrVersionDataSourceMap = new HashMap<>();
        for (DbCdrVersion cdrVersion : cdrVersionDao.findAll()) {
            try {
                DataSource dataSource = createDataSource(cdrVersion.getPublicDbName());
                if (dataSource instanceof org.apache.tomcat.jdbc.pool.DataSource) {
                    org.apache.tomcat.jdbc.pool.DataSource tomcatSource =
                            (org.apache.tomcat.jdbc.pool.DataSource) dataSource;
                    // A Tomcat DataSource implements PoolConfiguration, therefore these pool parameters can
                    // normally be populated via @ConfigurationProperties. Since we are directly initializing
                    // DataSources here without a hook to @ConfigurationProperties, we instead need to
                    // explicitly initialize the pool parameters here. We override the primary connection
                    // info, as the autowired PoolConfiguration is initialized from the same set of properties
                    // as the workbench DB.
                    PoolConfiguration cdrPool = new PoolProperties();
                    BeanUtils.copyProperties(basePoolConfig, cdrPool);
                    cdrPool.setUsername(dbUser);
                    cdrPool.setPassword(dbPassword);
                    cdrPool.setUrl(String.format("jdbc:mysql:///%s", cdrVersion.getPublicDbName()));
                    tomcatSource.setPoolProperties(cdrPool);

                    // The Spring autowiring is a bit of a maze here, log something concrete which will allow
                    // verification that the DB settings in application.properties are actually being loaded.
                    log.info("using Tomcat pool for CDR data source, with minIdle: " + cdrPool.getMinIdle());
                } else {
                    log.warning(
                            "not using Tomcat pool or initializing pool configuration; "
                                    + "this should only happen within tests");
                }

                cdrVersionDataSourceMap.put(cdrVersion.getCdrVersionId(), dataSource);
            } catch (HikariPool.PoolInitializationException e) {
                // If this is caught, java.sql.SQLSyntaxErrorException: Unknown database 'name'
                // was thrown, so no need to repeat here.
            }
        }
        setTargetDataSources(cdrVersionDataSourceMap);
    }
    @Override
    protected Object determineCurrentLookupKey() {
        return CdrVersionContext.getCdrVersion().getCdrVersionId();
    }
}