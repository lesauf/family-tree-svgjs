import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphModule } from '@swimlane/ngx-graph';
// import { NgFamilyTreeModule } from 'ng-family-tree';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicGraphComponent } from './basic-graph/basic-graph.component';
import { DlacremeComponent } from './dlacreme/dlacreme.component';
import { BasicFamilyComponent } from './basic-family/basic-family.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';
import { CssComponent } from './css/css.component';
// import { BasicD3Component } from './basic-d3/basic-d3.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    BasicGraphComponent,
    DlacremeComponent,
    BasicFamilyComponent,
    NgxGraphOrgTreeComponent,
    CssComponent,
    // BasicD3Component
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxGraphModule,
    // NgFamilyTreeModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
