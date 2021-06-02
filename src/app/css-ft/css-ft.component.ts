import { Component, OnInit } from '@angular/core';
import { Family } from '../shared/models/family.model';

@Component({
  selector: 'app-css-ft',
  templateUrl: './css-ft.component.html',
  styleUrls: ['./css-ft.component.scss'],
})
export class CssFtComponent implements OnInit {
  title = 'demo';

  onLeafSelected(data) {
    console.log(data);
  }

  family: Family = {
    nodes: [
      { name: 'padre', gender: 'male' },
      { name: 'madre', gender: 'female' },
    ],
    children: [
      {
        nodes: [{ name: 'Me', relationship: 'self' }],
        children: [
          { nodes: [{ name: 'Grand Grand Child 2' }] },
          { nodes: [{ name: 'Grand Grand Child 3' }] },
        ],
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}
}
