import {testEnvironmentBase} from 'environments/test-env-base';

export const environment = {
  ...testEnvironmentBase,
  displayTag: 'Local->Test',
  workbenchUrl: 'http://localhost:4200',
  publicUiUrl: 'http://localhost:4201',
  debug: true,
};
