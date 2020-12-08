import {testEnvironmentBase} from 'environments/test-env-base';

export const environment = {
  ...testEnvironmentBase,
  displayTag: 'Local->Local',
  publicApiUrl: 'http://localhost:8083',
  debug: true,
  gaId: 'UA-116298798-4',
  gtmId: 'GTM-NQ9XDTW',
  gtmAuth: 'kMy-ZUX8XsBfuanMZzP_5A',
  gtmPreview: 'env-25',
  fitbit: true
};
