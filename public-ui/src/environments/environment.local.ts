import {testEnvironmentBase} from 'environments/test-env-base';

export const environment = {
  ...testEnvironmentBase,
  displayTag: 'Local->Local',
  publicApiUrl: 'http://localhost:8083',
  researchAllOfUsUrl: 'https://staging.researchallofus.org',
  debug: true,
  gaId: 'UA-112406425-5',
};
