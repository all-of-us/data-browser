package org.pmiops.workbench.publicapi;

import com.google.common.collect.ImmutableSet;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.inject.Provider;
import org.pmiops.workbench.config.WorkbenchConfig;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.pmiops.workbench.model.CdrVersion;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.model.CdrVersionListResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.pmiops.workbench.service.CdrVersionService;

@RestController
public class CdrVersionsController implements CdrVersionsApiDelegate {
  private static final Logger log = Logger.getLogger(CdrVersionsController.class.getName());

  private final CdrVersionService cdrVersionService;
  private final Provider<WorkbenchConfig> workbenchConfigProvider;

  @Autowired
  CdrVersionsController(CdrVersionService cdrVersionService, Provider<WorkbenchConfig> workbenchConfigProvider) {
    this.cdrVersionService = cdrVersionService;
    this.workbenchConfigProvider = workbenchConfigProvider;
  }


  @Override
  public ResponseEntity<CdrVersionListResponse> getCdrVersions() {
    // We return CDR versions for just registered CDR versions; controlled CDR data is currently
    // out of scope for the data browser.
    List<CdrVersion> cdrVersions = cdrVersionService.findAllByOrderByCreationTimeDesc();
    if (cdrVersions.isEmpty()) {
      throw new ServerErrorException("Did not find a default CDR version");
    }
    if (cdrVersions.size() > 1) {
      log.severe(String.format(
              "Found multiple (%d) default CDR versions, picking one", cdrVersions.size()));
    }

    // TODO: consider different default CDR versions for different access levels
    return ResponseEntity.ok(new CdrVersionListResponse().items(cdrVersions)
      .defaultCdrVersionId(cdrVersions.get(0).getCdrVersionId()));
  }
}
