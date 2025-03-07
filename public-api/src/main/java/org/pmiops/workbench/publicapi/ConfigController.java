package org.pmiops.workbench.publicapi;

import org.pmiops.workbench.config.WorkbenchConfig;
import org.pmiops.workbench.model.ConfigResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import jakarta.inject.Provider;

@RestController
public class ConfigController implements ConfigApiDelegate {

  private final Provider<WorkbenchConfig> configProvider;

  @Autowired
  ConfigController(Provider<WorkbenchConfig> configProvider) {
    this.configProvider = configProvider;
  }

  @Override
  public ResponseEntity<ConfigResponse> getConfig() {
    WorkbenchConfig config = configProvider.get();
    return ResponseEntity.ok(
        new ConfigResponse()
            .projectId(config.server.projectId)
            .dataBrowserIsSafe(true) // change to false for emergency shutdown of frontend
            .publicApiKeyForErrorReports(config.server.publicApiKeyForErrorReports));
  }
}
