import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicD3Component } from './basic-d3/basic-d3.component';
import { BasicGraphComponent } from './basic-graph/basic-graph.component';
import { CssComponent } from './css/css.component';
import { DlacremeComponent } from './dlacreme/dlacreme.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';

const routes: Routes = [
  {
    path: '',
    component: BasicD3Component,
  },
  {
    path: 'css',
    component: CssComponent,
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
