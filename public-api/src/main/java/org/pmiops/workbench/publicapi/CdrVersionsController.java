package org.pmiops.workbench.publicapi;

import com.google.common.collect.ImmutableSet;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.inject.Provider;
import org.pmiops.workbench.config.WorkbenchConfig;
import org.pmiops.workbench.db.dao.CdrVersionDao;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.model.CdrVersionListResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.pmiops.workbench.cdr.CdrVersionMapper;

@RestController
public class CdrVersionsController implements CdrVersionsApiDelegate {
  private static final Logger log = Logger.getLogger(CdrVersionsController.class.getName());

  private final CdrVersionDao cdrVersionDao;
  private final CdrVersionMapper cdrVersionMapper;
  private final Provider<WorkbenchConfig> workbenchConfigProvider;

  @Autowired
  CdrVersionsController(CdrVersionDao cdrVersionDao, Provider<WorkbenchConfig> workbenchConfigProvider,
                        CdrVersionMapper cdrVersionMapper) {
    this.cdrVersionDao = cdrVersionDao;
    this.cdrVersionMapper = cdrVersionMapper;
    this.workbenchConfigProvider = workbenchConfigProvider;
  }


  @Override
  public ResponseEntity<CdrVersionListResponse> getCdrVersions() {
    // We return CDR versions for just registered CDR versions; controlled CDR data is currently
    // out of scope for the data browser.
    List<DbCdrVersion> cdrVersions = cdrVersionDao
        .findAllByOrderByCreationTimeDesc();
    List<Long> defaultVersions = cdrVersions.stream()
      .filter(v -> v.getIsDefault())
      .map(DbCdrVersion::getCdrVersionId)
      .collect(Collectors.toList());
    if (defaultVersions.isEmpty()) {
      throw new ServerErrorException("Did not find a default CDR version");
    }
    if (defaultVersions.size() > 1) {
      log.severe(String.format(
          "Found multiple (%d) default CDR versions, picking one", defaultVersions.size()));
    }
    // TODO: consider different default CDR versions for different access levels
    return ResponseEntity.ok(new CdrVersionListResponse()
      .items(cdrVersions.stream()
        .map(cdrVersionMapper::dbModelToClient)
        .collect(Collectors.toList()))
      .defaultCdrVersionId(Long.toString(defaultVersions.get(0))));
  }
}
