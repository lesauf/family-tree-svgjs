import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicD3Component } from './basic-d3/basic-d3.component';
import { BasicGraphComponent } from './basic-graph/basic-graph.component';
import { CssFtComponent } from './css-ft/css-ft.component';
import { CssComponent } from './css/css.component';
import { DlacremeSvgComponent } from './dlacreme-svg/dlacreme-svg.component';
import { DlacremeComponent } from './dlacreme/dlacreme.component';
import { FamilyTreeComponent } from './family-tree/family-tree.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';

const routes: Routes = [
  {
    path: '',
    component: FamilyTreeComponent,
  },
  {
    path: 'css',
    component: CssComponent,
  },
  {
    path: 'css-ft',
    component: CssFtComponent,
  },
  {
    path: 'd3',
    component: BasicD3Component,
  },
  {
    path: 'basic',
    component: BasicGraphComponent,
  },
  {
    path: 'org',
    component: NgxGraphOrgTreeComponent,
  },
  {
    path: 'dlacreme',
    component: DlacremeComponent,
  },
  {
    path: 'dlacreme-svg',
    component: DlacremeSvgComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
