import {testEnvironmentBase} from 'environments/test-env-base';

export const environment = {
  ...testEnvironmentBase,
  displayTag: 'Local->Local',
  publicApiUrl: 'http://localhost:8083',
  publicUiUrl: 'http://localhost:4201',
  debug: true,
  gaId: 'UA-116298798-4',
};
