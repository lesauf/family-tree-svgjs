import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicD3Component } from './basic-d3/basic-d3.component';
import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree/ngx-graph-org-tree.component';

const routes: Routes = [
  {
    path: '',
    component: BasicD3Component,
  },
  {
    path: 'org',
    component: NgxGraphOrgTreeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
