import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Family } from '../../models/family.model';

@Component({
  selector: 'ft-leaf',
  templateUrl: './ft-leaf.component.html',
})
export class FtLeafComponent {
  @Input() child: Family;
  @Output() onLeafSelected: EventEmitter<Family> = new EventEmitter();

  constructor() {}

  _leafSelected(_leaf) {
    this.onLeafSelected.emit(_leaf);
  }
}
