import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-basic-graph',
  templateUrl: './basic-graph.component.html',
  styleUrls: ['./basic-graph.component.scss'],
})
export class BasicGraphComponent implements OnInit {
  view = [800, 200];

  showLegend = false;

  colorScheme = '';

  orientation = 'vertical';

  curve = '';

  hierarchialGraph = {
    links: [
      {
        source: 'start',
        target: '1',
        label: 'links to',
      },
      {
        source: 'start',
        target: '2',
      },
      {
        source: '1',
        target: '3',
        label: 'related to',
      },
      {
        source: '2',
        target: '4',
      },
      {
        source: '2',
        target: '6',
      },
      {
        source: '3',
        target: '5',
      },
    ],
    nodes: [
      {
        id: 'start',
        label: 'start',
      },
      {
        id: '1',
        label: 'Query ThreatConnect',
      },
      {
        id: '2',
        label: 'Query XForce',
      },
      {
        id: '3',
        label: 'Format Results',
      },
      {
        id: '4',
        label: 'Search Splunk',
      },
      {
        id: '5',
        label: 'Block LDAP',
      },
      {
        id: '6',
        label: 'Email Results',
      },
    ],
  };

  constructor() {}

  ngOnInit(): void {}

  onLegendLabelClick(event: any) {
    console.log('Clicked legend: ', event);
  }

  select(event: any) {
    console.log('Selected: ', event);
  }
}
