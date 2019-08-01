import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { ResearchDirectoryRoutingModule } from './research-directory-routing-module';
import { ResearchDirViewComponent } from './views/research-dir-view/research-dir-view.component';
@NgModule({
  imports: [
    CommonModule,
    ResearchDirectoryRoutingModule,
    SharedModule
  ],
  exports: [ResearchDirectoryRoutingModule,SharedModule],
  declarations: [ResearchDirViewComponent]
})
export class ResearchDirectoryModule { }
