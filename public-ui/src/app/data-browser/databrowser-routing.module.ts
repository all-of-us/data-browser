import { NgModule } from "@angular/core";
import { Router, RouterModule, Routes } from "@angular/router";
import { AppRouting } from "app/app-routing";
import { IsSafeGuard } from "app/guards/is-safe-guard.service";
import { NavStore } from "app/utils/navigation";
import { EmergencyComponent } from "app/views/emergency/emergency.component";

const routes: Routes = [

  {
    path: "ehr",
    redirectTo: "",
    pathMatch: "full",
    data: { title: "Data Browser" },
  },
  {
    path: "survey",
    redirectTo: "",
    pathMatch: "full",
  },
  {
    path: "",
    runGuardsAndResolvers: "always",
    canActivateChild: [IsSafeGuard],
    children: [
      {
        path: "",
        data: {
          title: "Data Browser",
          breadcrumb: {
            value: "Data Browser",
          },
        },
        children: [
          {
            path: "",
            component: AppRouting,
            data: {},
          },
          {
            path: "survey/:id",
            component: AppRouting,
            data: {
              title: "View Survey Questions and Answers",
              breadcrumb: {
                value: ":id survey",
              },
            },
          },
          {
            path: "survey/:id/:search",
            component: AppRouting,
            data: {
              title: "View Survey Questions and Answers",
              breadcrumb: {
                value: ":id survey",
              },
            },
          },
          {
            path: "ehr/:id",
            component: AppRouting,
            data: {
              title: "View Full Results",
              breadcrumb: {
                value: ":id",
              },
            },
          },
          {
            path: "ehr/:id/:search",
            component: AppRouting,
            data: {
              title: "View Full Results",
              breadcrumb: {
                value: ":id",
              },
            },
          },
          {
            path: "variants",
            component: AppRouting,
            canActivate: [IsSafeGuard],
            data: {
              title: "Genomic Variants",
              breadcrumb: {
                value: "Genomic Variants",
              },
            },
          },
          {
            path: "variants/:search",
            component: AppRouting,
            canActivate: [IsSafeGuard],
            data: {
              title: "Genomic Variants",
              breadcrumb: {
                value: "Genomic Variants",
              },
            },
          },
          {
            path: "structural-variants",
            component: AppRouting,
            canActivate: [IsSafeGuard],
            data: {
              title: "Genomic Variants",
              breadcrumb: {
                value: "Genomic Variants",
              },
            },
          },
          {
            path: "structural-variants/:search",
            component: AppRouting,
            canActivate: [IsSafeGuard],
            data: {
              title: "Genomic Variants",
              breadcrumb: {
                value: "Genomic Variants",
              },
            },
          },
          {
            path: "physical-measurements",
            component: AppRouting,
            data: {
              title: "Physical Measurements",
              breadcrumb: {
                value: "Physical Measurements",
              },
            },
          },
          {
            path: "physical-measurements/:search",
            component: AppRouting,
            data: {
              title: "Physical Measurements",
              breadcrumb: {
                value: "Physical Measurements",
              },
            },
          },
          {
            path: "fitbit",
            component: AppRouting,
            data: {
              title: "Fitbit Data",
              breadcrumb: {
                value: "Fitbit Data",
              },
            },
          },
          {
            path: "fitbit/:search",
            component: AppRouting,
            data: {
              title: "Fitbit Data",
              breadcrumb: {
                value: "Fitbit Data",
              },
            },
          },
          {
            path: "introductory-videos",
            component: AppRouting,
            data: {
              title: "Introductory Videos",
              breadcrumb: {
                value: "Introductory Videos",
              },
            },
          },
        ],
      },
    ],
  },
  {
    path: "error",
    pathMatch: "full",
    component: EmergencyComponent,
    data: { title: "" },
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: "reload",
      relativeLinkResolution: "legacy",
    }),
  ],
  exports: [RouterModule],
  providers: [IsSafeGuard],
})
export class DataBrowserRoutingModule {
  constructor(public router: Router) {
    NavStore.navigate = (commands, extras) =>
      this.router.navigate(commands, extras);
    NavStore.navigateByUrl = (url, extras) =>
      this.router.navigateByUrl(url, extras);
    this.router.events.subscribe((event) => {});
  }
}
