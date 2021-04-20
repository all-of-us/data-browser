import { BreadcrumbType } from 'app/utils/navigation';
import {atom, Atom} from 'app/utils/subscribable';
import * as React from 'react';

export interface RouteDataStore {
  title?: string;
  minimizeChrome?: boolean;
  helpContentKey?: string;
  breadcrumb?: BreadcrumbType;
  pathElementForTitle?: string;
  notebookHelpSidebarStyles?: boolean;
  contentFullHeightOverride?: boolean;
}

export const routeDataStore = atom<RouteDataStore>({});
