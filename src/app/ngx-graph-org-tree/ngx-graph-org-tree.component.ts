import { Component, OnInit, Input } from '@angular/core';
import { ClusterNode, Edge, Node, Layout } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import { CustomDagre } from './custom-dagre';
import * as shape from 'd3-shape';

export class human {
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
  @Input() humans: human[] = [];

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
    this.humans = [
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
    for (const human of this.humans) {
      const node: Node = {
        id: human.id,
        label: human.name,
        position: {
          x: 0,
          y: 0,
        },
        data: {
          backgroundColor: human.backgroundColor,
        },
      };

      this.nodes.push(node);

      if (human.spouses) {
        const spousesCombIds = [];
        // Create hidden node for each spouses
        for (let i = 0; i < human.spouses.length; i++) {
          const maxId = Math.max(
            eval(human.id + human.spouses[i]),
            eval(human.spouses[i] + human.id)
          );
          spousesCombIds.push(maxId.toString());

          const joint: Node = {
            id: `${maxId}`,
            label: human.name + '+ spouse',
            data: {
              hidden: true,
              backgroundColor: human.backgroundColor,
            },
          };

          const exist = this.nodes.find((n) => n.id === `${maxId}`);

          if (exist === undefined) {
            this.nodes.push(joint);
          }
        }

        // Put Spouses in the same cluster
        // const clusterId = [human.id, ...human.spouses, ...spousesCombIds]
        //   .sort()
        //   .join('');

        // const cluster: ClusterNode = {
        //   id: clusterId,
        //   label: '',
        //   childNodeIds: [human.id, ...human.spouses, ...spousesCombIds],
        // };

        // if (this.clusters.find((c) => c.id === clusterId) === undefined) {
        //   this.clusters.push(cluster);
        // }
      }
    }

    // LINKS
    for (const human of this.humans) {
      if (human.spouses) {
        for (let i = 0; i < human.spouses.length; i++) {
          const maxId = Math.max(
            eval(human.id + human.spouses[i]),
            eval(human.spouses[i] + human.id)
          );

          // Links between spouses
          const edge1: Edge = {
            source: human.id,
            target: `${maxId}`,
            // target: human.spouses[i],
            label: '',
            data: {
              linkText: 'Manager of',
            },
          };
          const edge2: Edge = {
            source: human.spouses[i],
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
      if (human.parents) {
        const maxId = Math.max(
          eval(human.parents[0] + human.parents[1]),
          eval(human.parents[1] + human.parents[0])
        );

        const edge1: Edge = {
          source: `${maxId}`,
          target: human.id,
          label: '',
          data: {
            linkText: 'Manager of',
          },
        };
        const edge2: Edge = {
          source: `${maxId}`,
          target: human.id,
          label: '',
          data: {
            linkText: 'Manager of',
          },
        };
        this.links.push(edge1);
        this.links.push(edge2);
      }

      if (!human.upperManagerId) {
        continue;
      }

      // const edge: Edge = {
      //   source: human.upperManagerId,
      //   target: human.id,
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
