import { Component, OnInit, Input } from '@angular/core';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import * as shape from 'd3-shape';

export class Employee {
  id: string;
  name: string;
  office: string;
  role: string;
  spouses?: string[];
  parents?: string[];
  backgroundColor: string;
  upperManagerId?: string;
}

@Component({
  selector: 'ngx-graph-org-tree',
  templateUrl: './ngx-graph-org-tree.component.html',
  styleUrls: ['./ngx-graph-org-tree.component.scss'],
})
export class NgxGraphOrgTreeComponent implements OnInit {
  @Input() employees: Employee[] = [];

  public nodes: Node[] = [];
  public links: Edge[] = [];
  public layoutSettings = {
    orientation: 'TB',
  };
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();

  constructor() {
    this.employees = [
      {
        id: '1',
        name: 'Adam',
        office: 'Office 1',
        spouses: ['6'],
        role: 'Manager',
        backgroundColor: '#DC143C',
      },
      {
        id: '2',
        name: 'Cain',
        office: 'Office 2',
        role: 'Engineer',
        parents: ['1', '6'],
        backgroundColor: '#00FFFF',
        upperManagerId: '1',
      },
      {
        id: '3',
        name: 'Abel',
        office: 'Office 3',
        role: 'Engineer',
        parents: ['1', '6'],
        backgroundColor: '#00FFFF',
        upperManagerId: '1',
      },
      // {
      //   id: '4',
      //   name: 'Employee 4',
      //   office: 'Office 4',
      //   role: 'Engineer',
      //   backgroundColor: '#00FFFF',
      //   upperManagerId: '1',
      // },
      // {
      //   id: '5',
      //   name: 'Employee 5',
      //   office: 'Office 5',
      //   role: 'Student',
      //   backgroundColor: '#8A2BE2',
      //   upperManagerId: '4',
      // },
      {
        id: '6',
        name: 'Eve',
        office: 'Office 6',
        role: 'Spouse',
        spouses: ['1'],
        backgroundColor: '#dddddd',
      },
      // {
      //   id: '7',
      //   name: 'Employee 7',
      //   office: 'Office 7',
      //   role: 'Spouse',
      //   spouses: ['1'],
      //   backgroundColor: '#564354',
      // },
    ];
  }

  public ngOnInit(): void {
    for (const employee of this.employees) {
      const node: Node = {
        id: employee.id,
        label: employee.name,
        data: {
          office: employee.office,
          role: employee.role,
          backgroundColor: employee.backgroundColor,
        },
      };

      this.nodes.push(node);

      if (employee.spouses) {
        // Create hidden node for each spouses
        for (let i = 0; i < employee.spouses.length; i++) {
          const maxId = Math.max(
            eval(employee.id + employee.spouses[i]),
            eval(employee.spouses[i] + employee.id)
          );

          const joint: Node = {
            id: `${maxId}`,
            label: employee.name + '+ spouse',
            data: {
              hidden: true,
              office: 'Wedding',
              role: 'Married',
              backgroundColor: employee.backgroundColor,
            },
          };

          const exist = this.nodes.find((n) => n.id === `${maxId}`);

          if (exist === undefined) {
            this.nodes.push(joint);
          }
        }
      }
    }

    // LINKS
    for (const employee of this.employees) {
      if (employee.spouses) {
        for (let i = 0; i < employee.spouses.length; i++) {
          const maxId = Math.max(
            eval(employee.id + employee.spouses[i]),
            eval(employee.spouses[i] + employee.id)
          );

          // Links between spouses
          const edge1: Edge = {
            source: employee.id,
            target: `${maxId}`,
            label: '',
            data: {
              linkText: 'Manager of',
            },
          };
          const edge2: Edge = {
            source: employee.spouses[i],
            target: `${maxId}`,
            label: '',
            data: {
              linkText: 'Manager of',
            },
          };
          this.links.push(edge1);
          this.links.push(edge2);
        }
      }

      // Links between parents and children
      if (employee.parents) {
        const maxId = Math.max(
          eval(employee.parents[0] + employee.parents[1]),
          eval(employee.parents[1] + employee.parents[0])
        );

        const edge1: Edge = {
          source: `${maxId}`,
          target: employee.id,
          label: '',
          data: {
            linkText: 'Manager of',
          },
        };
        // const edge2: Edge = {
        //   source: employee.parents[1],
        //   target: employee.id,
        //   label: '',
        //   data: {
        //     linkText: 'Manager of',
        //   },
        // };
        this.links.push(edge1);
        // this.links.push(edge2);
      }

      if (!employee.upperManagerId) {
        continue;
      }

      // const edge: Edge = {
      //   source: employee.upperManagerId,
      //   target: employee.id,
      //   label: '',
      //   data: {
      //     linkText: 'Manager of',
      //   },
      // };

      // this.links.push(edge);
    }
  }

  public getStyles(node: Node): any {
    return {
      'background-color': node.data.backgroundColor,
    };
  }
}
