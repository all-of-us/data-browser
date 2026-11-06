package org.pmiops.workbench.cdr;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.pool.HikariPool;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.sql.DataSource;
import org.apache.tomcat.jdbc.pool.PoolConfiguration;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.stereotype.Service;

@Service("cdrDataSource")
public class CdrDataSource extends AbstractRoutingDataSource {

    private static final Logger log = Logger.getLogger(CdrDataSource.class.getName());

    private final DbParams params;
    private final PoolConfiguration basePoolConfig;
    private final PoolConfiguration cdrPoolConfig;
    private final EntityManagerFactory emFactory;

    // CDR version ID -> public DB name, for versions whose DB could not be opened at startup.
    private final Map<Object, String> unavailableVersions = new HashMap<>();

    CdrDataSource(
            DbParams params,
            @Qualifier("poolConfiguration") PoolConfiguration basePoolConfig,
            @Qualifier("cdrPoolConfiguration") PoolConfiguration cdrPoolConfig,
            // Using CdrDbConfig.cdrEntityManagerFactory would cause a circular dependency.
            @Qualifier("entityManagerFactory") EntityManagerFactory emFactory) {
        this.params = params;
        this.basePoolConfig = basePoolConfig;
        this.cdrPoolConfig = cdrPoolConfig;
        this.emFactory = emFactory;
        resetTargetDataSources();
    }

    List<DbCdrVersion> getCdrVersions() {
        EntityManager em = emFactory.createEntityManager();
        String jpql = "SELECT v FROM DbCdrVersion v";
        TypedQuery<DbCdrVersion> query = em.createQuery(jpql, DbCdrVersion.class);
        try {
            return query.getResultList();
        } catch (PersistenceException e) {
            // This emits "Table 'CDR_VERSION' not found" before throwing to this catch, so it is not
            // necessary to warn further.
            return new ArrayList<>();
        } finally {
            em.close();
        }
    }

    DataSource createCdrDs(String dbName) {
        return new HikariDataSource(params.createConfig(dbName));
    }

    void resetTargetDataSources() {
        // Build a map of CDR version ID -> DataSource based on all entries in the cdr_version table.
        // If new CDR versions are inserted, the server must be restarted for them to be used.
        // A version whose DB cannot be opened is skipped and recorded, so one bad row cannot take
        // down the others; requests for it fail with a clear message (see determineTargetDataSource).
        Map<Object, Object> cdrVersionDataSourceMap = new HashMap<>();
        unavailableVersions.clear();

        for (DbCdrVersion cdrVersion : getCdrVersions()) {
            Object id = cdrVersion.getCdrVersionId();
            String dbName = cdrVersion.getPublicDbName();
            try {
                DataSource dataSource = createCdrDs(dbName);
                if (dataSource == null) {
                    unavailableVersions.put(id, dbName);
                    continue;
                }
                cdrVersionDataSourceMap.put(id, dataSource);
            } catch (HikariPool.PoolInitializationException e) {
                unavailableVersions.put(id, dbName);
                log.log(
                        Level.SEVERE,
                        String.format(
                                "CDR version %s unavailable: could not open database '%s' (%s). "
                                        + "Restore the database or remove this cdr_version row, then restart.",
                                id, dbName, e.getMessage()));
            }
        }

        log.info(
                String.format(
                        "CDR datasources ready: %d available %s, %d unavailable %s",
                        cdrVersionDataSourceMap.size(),
                        cdrVersionDataSourceMap.keySet(),
                        unavailableVersions.size(),
                        unavailableVersions));

        setTargetDataSources(cdrVersionDataSourceMap);
    }

    @Override
    protected Object determineCurrentLookupKey() {
        return CdrVersionContext.getCdrVersion().getCdrVersionId();
    }

    @Override
    protected DataSource determineTargetDataSource() {
        Object key = determineCurrentLookupKey();
        String missingDb = unavailableVersions.get(key);
        if (missingDb != null) {
            throw new IllegalStateException(
                    String.format(
                            "CDR version %s is unavailable: database '%s' could not be opened when this "
                                    + "instance started. Restore the database and restart instances.",
                            key, missingDb));
        }
        return super.determineTargetDataSource();
    }

    Optional<String> getEnv(String name) {
        return Optional.ofNullable(System.getenv(name)).map(String::trim).filter(s -> !s.isEmpty());
    }

    String getEnvRequired(String name) {
        return getEnv(name).orElseThrow(() -> new IllegalStateException(name + " not defined"));
    }
}