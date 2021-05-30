import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphModule } from '@swimlane/ngx-graph';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicGraphComponent } from './basic-graph/basic-graph.component';
import { DlacremeComponent } from './dlacreme/dlacreme.component';
import { FamilyTreeComponent } from './family-tree/family-tree.component';
import { BasicFamilyComponent } from './basic-family/basic-family.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';
// import { BasicD3Component } from './basic-d3/basic-d3.component';

@NgModule({
  declarations: [
    AppComponent,
    BasicGraphComponent,
    DlacremeComponent,
    FamilyTreeComponent,
    BasicFamilyComponent,
    NgxGraphOrgTreeComponent,
    // BasicD3Component
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxGraphModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
