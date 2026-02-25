import * as React from "react";
import {
  BrowserRouter,
  Link,
  Navigate as RRNavigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import * as fp from "lodash/fp";

import { navigate } from "app/utils/navigation";
import { routeDataStore } from "app/utils/stores";

export const withRouteData =
  (WrappedComponent) =>
  ({ routeData, ...props }) => {
    routeDataStore.set(routeData);
    return <WrappedComponent {...props} />;
  };

export const withFullHeight =
  (WrappedComponent) =>
  ({ ...props }) => {
    return (
      <div style={{ height: "100%" }}>
        <WrappedComponent {...props} />
      </div>
    );
  };

export const SubRoute = ({ children }): React.ReactElement => (
  <Routes>{children}</Routes>
);
export const AppRouter = ({ children }): React.ReactElement => (
  <BrowserRouter>
    <Routes>{children}</Routes>
  </BrowserRouter>
);

export const RouteLink = ({
  path,
  style = {},
  children,
}): React.ReactElement => (
  <Link style={{ ...style }} to={path}>
    {children}
  </Link>
);

// To compensate for Angular, while keeping true to the declarative/componentized nature of the router
// We will utilize a redirect component that uses the Angular navigation.
// Upon completing the migration this can be replaced with a react-router Navigate component.
// Exported for testing.
export const NavRedirect = ({ path }) => {
  navigate([path]);
  return null;
};

const AppRouteInner = ({
  data = {},
  guards = [],
  component: Component,
}): React.ReactElement => {
  const routeParams = useParams();
  const routeNavigate = useNavigate();

  const { redirectPath = null } =
    fp.find(({ allowed }) => !allowed(), guards) || {};
  return redirectPath ? (
    <NavRedirect path={redirectPath} />
  ) : (
    <Component
      urlParams={routeParams}
      routeHistory={{ push: routeNavigate }}
      routeConfig={data}
    />
  );
};

export const AppRoute = ({
  path,
  data = {},
  guards = [],
  component: Component,
}): React.ReactElement => {
  return (
    <Route
      path={path}
      element={
        <AppRouteInner
          data={data}
          guards={guards}
          component={Component}
        />
      }
    />
  );
};

export const Navigate = ({ to }): React.ReactElement => {
  const location = useLocation();
  return <RRNavigate to={to} state={{ from: location }} replace />;
};
