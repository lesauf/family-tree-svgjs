import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtLeafComponent } from './components/ft-leaf/ft-leaf.component';
import { NgFamilyTreeComponent } from './components/ng-family-tree/ng-family-tree.component';

@NgModule({
  declarations: [FtLeafComponent, NgFamilyTreeComponent],
  imports: [CommonModule],
  exports: [FtLeafComponent, NgFamilyTreeComponent],
})
export class SharedModule {}
