import { Component, OnInit, Input } from '@angular/core';
import { ClusterNode, Edge, Node, Layout } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import { CustomDagre } from './custom-dagre';
import * as shape from 'd3-shape';

export class Employee {
  id: string;
  name: string;
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
  public clusters: ClusterNode[] = [];

  public layoutSettings = {
    orientation: 'TB',
  };
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();
  // public layout: Layout = new CustomDagre();

  constructor() {
    this.employees = [
      {
        id: '1',
        name: 'Adam',
        spouses: ['2'],
        backgroundColor: '#DC143C',
      },
      {
        id: '2',
        name: 'Eve',
        spouses: ['1'],
        backgroundColor: '#dddddd',
      },
      {
        id: '3',
        name: 'Cain',
        parents: ['1', '2'],
        backgroundColor: '#00FFFF',
        upperManagerId: '1',
      },
      {
        id: '4',
        name: 'Abel',
        parents: ['1', '2'],
        backgroundColor: '#00FFFF',
        upperManagerId: '1',
      },
    ];
  }

  public ngOnInit(): void {
    for (const employee of this.employees) {
      const node: Node = {
        id: employee.id,
        label: employee.name,
        position: {
          x: 0,
          y: 0,
        },
        data: {
          backgroundColor: employee.backgroundColor,
        },
      };

      this.nodes.push(node);

      if (employee.spouses) {
        const spousesCombIds = [];
        // Create hidden node for each spouses
        for (let i = 0; i < employee.spouses.length; i++) {
          const maxId = Math.max(
            eval(employee.id + employee.spouses[i]),
            eval(employee.spouses[i] + employee.id)
          );
          spousesCombIds.push(maxId.toString());

          const joint: Node = {
            id: `${maxId}`,
            label: employee.name + '+ spouse',
            data: {
              hidden: true,
              backgroundColor: employee.backgroundColor,
            },
          };

          const exist = this.nodes.find((n) => n.id === `${maxId}`);

          if (exist === undefined) {
            this.nodes.push(joint);
          }
        }

        // Put Spouses in the same cluster
        // const clusterId = [employee.id, ...employee.spouses, ...spousesCombIds]
        //   .sort()
        //   .join('');

        // const cluster: ClusterNode = {
        //   id: clusterId,
        //   label: '',
        //   childNodeIds: [employee.id, ...employee.spouses, ...spousesCombIds],
        // };

        // if (this.clusters.find((c) => c.id === clusterId) === undefined) {
        //   this.clusters.push(cluster);
        // }
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
            // target: employee.spouses[i],
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
        const edge2: Edge = {
          source: `${maxId}`,
          target: employee.id,
          label: '',
          data: {
            linkText: 'Manager of',
          },
        };
        this.links.push(edge1);
        this.links.push(edge2);
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
      // 'background-color': node.data.backgroundColor,
    };
  }
}
