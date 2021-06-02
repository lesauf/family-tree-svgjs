import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Family } from '../../models/family.model';

@Component({
  selector: 'ft-tree',
  templateUrl: './ng-family-tree.component.html',
  styleUrls: ['./ng-family-tree.component.scss'],
})
export class NgFamilyTreeComponent implements OnInit {
  @Input() family: Family;
  @Output() onLeafSelected: EventEmitter<Family> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  _leafSelected(_leaf) {
    this.onLeafSelected.emit(_leaf);
  }

  _setWidth(child: Family) {
    return (
      child.nodes &&
      child.nodes[0].relationship === 'self' &&
      child.children.length < 2
    );
  }
}
