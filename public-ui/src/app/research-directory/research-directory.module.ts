import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RdTableComponent } from './components/rd-table/rd-table.component';
import { ResearchDirectoryRoutingModule } from './research-directory-routing-module';
import { ResearchDirViewComponent } from './views/research-dir-view/research-dir-view.component';
@NgModule({
  imports: [
    CommonModule,
    ResearchDirectoryRoutingModule,
    SharedModule
  ],
  exports: [ResearchDirectoryRoutingModule, RdTableComponent, SharedModule],
  declarations: [ResearchDirViewComponent, RdTableComponent]
})
export class ResearchDirectoryModule { }
