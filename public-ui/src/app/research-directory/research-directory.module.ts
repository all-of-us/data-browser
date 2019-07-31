import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ResearchDirectoryRoutingModule } from './research-directory-routing-module';
import { ResearchDirectoryComponent } from './views/research-directory/research-directory.component';
@NgModule({
  imports: [
    CommonModule,
    ResearchDirectoryRoutingModule
  ],
  exports: [ResearchDirectoryRoutingModule],
  declarations: [ResearchDirectoryComponent]
})
export class ResearchDirectoryModule { }
