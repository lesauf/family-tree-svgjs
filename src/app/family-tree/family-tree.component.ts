import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-family-tree',
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.scss'],
})
export class FamilyTreeComponent implements AfterViewInit, OnInit {
  zoomToFit$: Subject<boolean> = new Subject();

  center$: Subject<boolean> = new Subject();

  showLegend = false;

  colorScheme = '';

  orientation = 'vertical';

  curve = '';

  hierarchialGraph = {
    links: [
      {
        source: '1',
        target: '1-2',
        label: 'links to',
      },
      {
        source: '2',
        target: '1-2',
        label: 'links to',
      },
      {
        source: '1-2',
        target: '3',
        label: 'links to',
      },
      // {
      //   source: 'start',
      //   target: '1',
      //   label: 'links to',
      // },
      // {
      //   source: 'start',
      //   target: '2',
      // },
      // {
      //   source: '1',
      //   target: '3',
      //   label: 'related to',
      // },
      // {
      //   source: '2',
      //   target: '4',
      // },
      // {
      //   source: '2',
      //   target: '6',
      // },
      // {
      //   source: '3',
      //   target: '5',
      // },
    ],
    nodes: [
      {
        id: '1',
        label: 'John',
        spouse: 2,
      },
      {
        id: '1-2',
        label: 'John-Loise',
        hidden: true,
      },
      {
        id: '2',
        label: 'Loise',
      },
      {
        id: '3',
        label: 'Jack',
        parents: '1-2',
      },
      // {
      //   id: 3,
      //   name: 'Charlie',
      //   child_of: 'Jack',
      //   grand_child_of: 1,
      // },
      // {
      //   id: 'start',
      //   label: 'start',
      // },
      // {
      //   id: '1',
      //   label: 'Query ThreatConnect',
      // },
      // {
      //   id: '2',
      //   label: 'Query XForce',
      // },
      // {
      //   id: '3',
      //   label: 'Format Results',
      // },
      // {
      //   id: '4',
      //   label: 'Search Splunk',
      // },
      // {
      //   id: '5',
      //   label: 'Block LDAP',
      // },
      // {
      //   id: '6',
      //   label: 'Email Results',
      // },
    ],
  };

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.zoomToFit$.next(true);
    this.center$.next(true);
  }

  onLegendLabelClick(event: any) {
    console.log('Clicked legend: ', event);
  }

  select(event: any) {
    console.log('Selected: ', event);
  }
}
