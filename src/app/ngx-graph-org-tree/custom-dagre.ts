import { Graph, Layout, Edge, Node } from '@swimlane/ngx-graph';
import * as dagre from 'dagre';
import { Observable } from 'rxjs';

export enum Orientation {
  LEFT_TO_RIGHT = 'LR',
  RIGHT_TO_LEFT = 'RL',
  TOP_TO_BOTTOM = 'TB',
  BOTTOM_TO_TOM = 'BT',
}
export enum Alignment {
  CENTER = 'C',
  UP_LEFT = 'UL',
  UP_RIGHT = 'UR',
  DOWN_LEFT = 'DL',
  DOWN_RIGHT = 'DR',
}

export interface DagreSettings {
  orientation?: Orientation;
  marginX?: number;
  marginY?: number;
  edgePadding?: number;
  rankPadding?: number;
  nodePadding?: number;
  align?: Alignment;
  acyclicer?: 'greedy' | undefined;
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
  multigraph?: boolean;
  compound?: boolean;
}

export interface DagreNodesOnlySettings extends DagreSettings {
  curveDistance?: number;
}

const DEFAULT_EDGE_NAME = '\x00';
const GRAPH_NODE = '\x00';
const EDGE_KEY_DELIM = '\x01';

export class CustomDagre implements Layout {
  settings?: DagreNodesOnlySettings = {
    orientation: Orientation.LEFT_TO_RIGHT,
  };

  dagreGraph: any;
  dagreNodes: any;
  dagreEdges: any;

  run(graph: Graph): Graph | Observable<Graph> {
    console.log(graph);

    // Create a new directed graph and add the nodes and edges
    this.createDagreGraph(graph);
    // ask dagre to do the layout for these nodes and edges
    dagre.layout(this.dagreGraph);

    graph.edgeLabels = this.dagreGraph._edgeLabels;

    // this.consoleValues();

    for (const dagreNodeId in this.dagreGraph._nodes) {
      const dagreNode = this.dagreGraph._nodes[dagreNodeId];
      const node = graph.nodes.find((n) => n.id === dagreNode.id);
      node.position = {
        x: dagreNode.x,
        y: dagreNode.y,
      };
      node.dimension = {
        width: dagreNode.width,
        height: dagreNode.height,
      };
    }

    // for (const edge of graph.edges) {
    //   this.updateEdge(graph, edge);
    // }

    return graph;
  }

  updateEdge(graph: Graph, edge: Edge): Graph | Observable<Graph> {
    const sourceNode = graph.nodes.find((n) => n.id === edge.source);
    const targetNode = graph.nodes.find((n) => n.id === edge.target);

    const rankAxis: 'x' | 'y' =
      this.settings.orientation === 'BT' || this.settings.orientation === 'TB'
        ? 'y'
        : 'x';
    const orderAxis: 'x' | 'y' = rankAxis === 'y' ? 'x' : 'y';
    const rankDimension = rankAxis === 'y' ? 'height' : 'width';

    // determine new arrow position
    const dir =
      sourceNode.position[rankAxis] <= targetNode.position[rankAxis] ? -1 : 1;
    const startingPoint = {
      [orderAxis]: sourceNode.position[orderAxis],
      [rankAxis]:
        sourceNode.position[rankAxis] -
        dir * (sourceNode.dimension[rankDimension] / 2),
    };
    const endingPoint = {
      [orderAxis]: targetNode.position[orderAxis],
      [rankAxis]:
        targetNode.position[rankAxis] +
        dir * (targetNode.dimension[rankDimension] / 2),
    };

    // generate new points
    edge.points = [
      startingPoint,
      {
        [rankAxis]: (startingPoint[rankAxis] + endingPoint[rankAxis]) / 2,
        [orderAxis]: startingPoint[orderAxis],
      },
      {
        [orderAxis]: endingPoint[orderAxis],
        [rankAxis]: (startingPoint[rankAxis] + endingPoint[rankAxis]) / 2,
      },
      endingPoint,
    ];
    const edgeLabelId = `${edge.source}${EDGE_KEY_DELIM}${edge.target}${EDGE_KEY_DELIM}${DEFAULT_EDGE_NAME}`;
    const matchingEdgeLabel = graph.edgeLabels[edgeLabelId];

    if (matchingEdgeLabel) {
      matchingEdgeLabel.points = edge.points;
    }

    return graph;
  }

  consoleValues() {
    this.dagreGraph.nodes().forEach((v) => {
      console.log('Node ' + v + ': ', this.dagreGraph.node(v));
    });
    this.dagreGraph.edges().forEach((e) => {
      console.log('Edge ' + e.v + ' -> ' + e.w + ': ', this.dagreGraph.edge(e));
    });
  }

  // onDragStart?(draggingNode: Node, $event: MouseEvent): void {
  //   throw new Error('Method not implemented.');
  // }
  // onDrag?(draggingNode: Node, $event: MouseEvent): void {
  //   throw new Error('Method not implemented.');
  // }
  // onDragEnd?(draggingNode: Node, $event: MouseEvent): void {
  //   throw new Error('Method not implemented.');
  // }

  public createDagreGraph(graph: Graph): any {
    // Create a new directed graph
    this.dagreGraph = new dagre.graphlib.Graph();

    // Set an object for the graph label
    this.dagreGraph.setGraph({
      rankdir: Orientation.TOP_TO_BOTTOM,
    });

    // Default to assigning a new object as a label for each new edge.
    this.dagreGraph.setDefaultEdgeLabel(function () {
      return {};
    });

    // Add nodes to the graph. The first argument is the node id. The second is
    // metadata about the node. In this case we're going to add labels to each
    // of our nodes.
    this.dagreNodes = graph.nodes.map((n) => {
      const node: any = Object.assign({}, n);
      node.width = n.dimension.width;
      node.height = n.dimension.height;
      node.x = n.position.x;
      node.y = n.position.y;

      return node;
    });

    // Add edges to the graph.
    this.dagreEdges = graph.edges.map((l) => {
      let linkId: number = 1;
      const newLink: any = Object.assign({}, l);
      if (!newLink.id) {
        newLink.id = linkId;
        linkId++;
      }
      return newLink;
    });

    for (const node of this.dagreNodes) {
      if (!node.width) {
        node.width = 20;
      }
      if (!node.height) {
        node.height = 30;
      }

      // update dagre
      this.dagreGraph.setNode(node.id, node);
    }

    // update dagre
    for (const edge of this.dagreEdges) {
      if (this.settings.multigraph) {
        this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
      } else {
        this.dagreGraph.setEdge(edge.source, edge.target);
      }
    }

    return this.dagreGraph;
  }
}
