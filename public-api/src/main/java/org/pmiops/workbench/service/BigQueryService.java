package org.pmiops.workbench.service;

import com.google.cloud.bigquery.BigQuery;
import com.google.cloud.bigquery.BigQueryException;
import com.google.cloud.bigquery.BigQueryOptions;
import com.google.cloud.bigquery.Field;
import com.google.cloud.bigquery.FieldList;
import com.google.cloud.bigquery.FieldValue;
import com.google.cloud.bigquery.InsertAllRequest;
import com.google.cloud.bigquery.InsertAllResponse;
import com.google.cloud.bigquery.JobInfo;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.TableId;
import com.google.cloud.bigquery.TableResult;
import com.google.common.annotations.VisibleForTesting;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import org.pmiops.workbench.cdr.CdrVersionContext;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.pmiops.workbench.exceptions.ForbiddenException;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.exceptions.ServerUnavailableException;
import org.pmiops.workbench.model.Domain;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BigQueryService {

    @Autowired private BigQuery defaultBigQuery;

    @VisibleForTesting
    protected BigQuery getBigQueryService() {
        DbCdrVersion cdrVersion = CdrVersionContext.getCdrVersion();
        if (cdrVersion == null) {
            return defaultBigQuery;
        }
        // If a query is being executed in the context of a CDR, it must be run within that project as
        // well. By default, the query would run in the Workbench App Engine project, which would
        // violate VPC-SC restrictions.
        return BigQueryOptions.newBuilder()
                .setProjectId(cdrVersion.getGenomicsProject())
                .build()
                .getService();
    }

    /** Execute the provided query using bigquery. */
    public TableResult executeQuery(QueryJobConfiguration query) {
        return executeQuery(query, 60000L);
    }

    /** Execute the provided query using bigquery. */
    public TableResult executeQuery(QueryJobConfiguration query, long waitTime) {
        try {
            return getBigQueryService()
                    .create(JobInfo.of(query))
                    .getQueryResults(BigQuery.QueryResultsOption.maxWaitTime(waitTime));
        } catch (InterruptedException e) {
            throw new BigQueryException(500, "Something went wrong with BigQuery: " + e.getMessage());
        } catch (BigQueryException e) {
            if (e.getCode() == HttpServletResponse.SC_SERVICE_UNAVAILABLE) {
                throw new ServerUnavailableException(
                        "BigQuery was temporarily unavailable, try again later", e);
            } else if (e.getCode() == HttpServletResponse.SC_FORBIDDEN) {
                throw new ForbiddenException("BigQuery access denied", e);
            } else {
                throw new ServerErrorException(
                        String.format(
                                "An unexpected error occurred querying against BigQuery with "
                                        + "query = (%s), params = (%s)",
                                query.getQuery(), query.getNamedParameters()),
                        e);
            }
        }
    }

    public QueryJobConfiguration filterBigQueryConfig(QueryJobConfiguration queryJobConfiguration) {
        DbCdrVersion cdrVersion = CdrVersionContext.getCdrVersion();
        if (cdrVersion == null) {
            throw new ServerErrorException("No CDR version specified");
        }

        String returnSql =
                queryJobConfiguration.getQuery().replace("${projectId}", cdrVersion.getGenomicsProject());
        returnSql = returnSql.replace("${dataSetId}", cdrVersion.getGenomicsDataset());
        return queryJobConfiguration.toBuilder().setQuery(returnSql).build();
    }

    public Map<String, Integer> getResultMapper(TableResult result) {
        if (result.getTotalRows() == 0) {
            return Collections.emptyMap();
        }
        AtomicInteger index = new AtomicInteger();
        return result.getSchema().getFields().stream()
                .collect(Collectors.toMap(Field::getName, s -> index.getAndIncrement()));
    }

    public Long getLong(List<FieldValue> row, int index) {
        return row.get(index).isNull() ? 0L : row.get(index).getLongValue();
    }

    public Double getDouble(List<FieldValue> row, int index) {
        return row.get(index).isNull() ? 0.0 : row.get(index).getDoubleValue();
    }

    public List<String> getList(List<FieldValue> row, int index) {
        if (row.get(index).isNull()) {
            throw new BigQueryException(500, "FieldValue is null at position: " + index);
        }
        return row.get(index).getRepeatedValue().stream()
                .map(FieldValue::getStringValue)
                .collect(Collectors.toList());
    }

    public boolean isNull(List<FieldValue> row, int index) {
        return row.get(index).isNull();
    }

    public String getString(List<FieldValue> row, int index) {
        return row.get(index).isNull() ? null : row.get(index).getStringValue();
    }

    public Boolean getBoolean(List<FieldValue> row, int index) {
        return row.get(index).getBooleanValue();
    }

    public String getDateTime(List<FieldValue> row, int index) {
        if (row.get(index).isNull()) {
            return null;
        }
        Instant instant = Instant.ofEpochMilli(row.get(index).getTimestampValue() / 1000L);
        ZonedDateTime zonedDateTime = instant.atZone(ZoneId.of("UTC"));
        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss zzz").withZone(ZoneId.of("UTC"));
        return df.format(zonedDateTime);
    }

    public String getDate(List<FieldValue> row, int index) {
        if (row.get(index).isNull()) {
            return null;
        }
        return row.get(index).getStringValue();
    }

    public InsertAllResponse insertAll(InsertAllRequest insertAllRequest) {
        return defaultBigQuery.insertAll(insertAllRequest);
    }
}
