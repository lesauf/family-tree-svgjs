import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import * as d3_base from 'd3';
import 'd3-tip';
import * as d3dag from 'd3-dag';
import { data } from './data';
import {
  Dag,
  DagNode,
  DagRoot,
  LayoutChildLink,
  LayoutDagNode,
  LayoutDagRoot,
  LayoutLink,
} from 'd3-dag/dist/dag/node';
import { SugiyamaOperator } from 'd3-dag';
import { merge } from 'rxjs';

const d3 = Object.assign({}, d3_base, d3dag);

declare global {
  interface Array<T> {
    remove: any;
  }
}

// extend javascript array class by a remove function
// copied from https://stackoverflow.com/a/3955096/12267732
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};
// Object.defineProperty(Array, 'remove', {
//   enumerable: false
// });

export type LinkDatum = {
  child: Node;
  data: string[];
  points: any[];
};

export type PersonData = {
  id: string;
  birthplace?: string;
  birthyear?: number;
  deathplace?: string;
  deathyear?: number;
  name?: string;
  own_unions?: any[];
  parent_union?: string;
  isUnion?: boolean;
};

export type UnionData = {
  id: string;
  partner: string[];
  children: string[];
};

export type Coordinates = {
  x?: number;
  x0?: number;
  y?: number;
  y0?: number;
};

export type NodeComputations = {
  _children?: any[];
  children?: any[];
  inserted_nodes?: any[];
  inserted_roots?: any[];
  neighbors?: any[];
  visible?: boolean;
  inserted_connections?: any[];
  height?: any;
};

export type Node = LayoutDagNode<PersonData, string[]> &
  Coordinates &
  NodeComputations;

/**
 * Family tree display using SVG & D3-DAG
 *
 * Constraints:
 * - All children must have two parents
 */
@Component({
  selector: 'app-basic-d3',
  templateUrl: './basic-d3.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./basic-d3.component.scss'],
})
export class BasicD3Component implements AfterViewInit, OnInit {
  @Input() data: {
    start: string;
    persons: { [id: string]: PersonData };
    unions: { [id: string]: UnionData };
    links: string[][];
  } = data;

  screen_width: any;
  screen_height: any;
  zoom: any;
  layout: SugiyamaOperator<any>;
  dag: Dag<DagNode<PersonData, string[]>>;
  root: any;
  g: any;
  svg: any;
  all_nodes: LayoutDagNode<PersonData, string[]>[];
  // helper variables
  i = 0;
  duration = 750;
  x_sep = 120;
  y_sep = 50;
  nodesSpacing: number = 30;
  margingAroundNodes: number = 3;
  marginAfter;
  unionYSep = 50;
  unionXSep = 100;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    // mark unions
    for (var k in data.unions) {
      data.unions[k].isUnion = true;
    }
    // mark persons
    for (var k in data.persons) {
      data.persons[k].isUnion = false;
    }
    // Set the dimensions and margins of the diagram
    this.screen_width = document.body.offsetWidth;
    this.screen_height = document.documentElement.clientHeight;

    // initialize panning, zooming
    this.zoom = d3
      .zoom()
      .on('zoom', (event, _) => this.g.attr('transform', event.transform));

    // append the svg object to the body of the page
    // assigns width and height
    // activates zoom/pan and tooltips
    this.svg = d3
      .select('#graph')
      .append('svg')
      .attr('width', this.screen_width)
      .attr('height', this.screen_height)
      .call(this.zoom);

    // append group element
    this.g = this.svg.append('g');

    // declare a dag layout and define the size of each node
    this.layout = d3
      .sugiyama()
      .nodeSize((node: Node) => {
        if (node.data && node.data.isUnion) {
          // Here
          return [this.unionXSep, this.unionYSep];
        } else {
          // Here set the dimensions of each node
          return [
            this.x_sep + this.nodesSpacing,
            this.y_sep + this.nodesSpacing,
          ];
        }
      })
      .layering(d3.layeringSimplex())
      // .decross(d3.decrossOpt())
      .decross(this.decrossCouples)
      .coord(d3.coordQuad());

    // this.layout;

    // make dag from edge list
    this.dag = d3.dagConnect()(data.links);

    // Populate node data
    this.all_nodes = this.dag.descendants();
    this.all_nodes = this.all_nodes.map((n: Node) => {
      n.data = data.persons[n.data.id]
        ? data.persons[n.data.id]
        : data.unions[n.data.id];
      // n.dataChildren = n.children; // all nodes collapsed by default
      // n.dataChildren = [];
      // // n.children = [];
      n.inserted_nodes = [];
      n.inserted_roots = [];
      n.neighbors = [];
      n.visible = false;
      n.inserted_connections = [];
      n.height = 10;

      return n;
    });

    // find root node and assign data
    this.root = this.all_nodes.find(
      (n: { data: { id: string } }) => n.data.id == data.start
    );

    this.root.visible = true;
    this.root.neighbors = this.getNeighbors(this.root);
    this.root.x0 = this.screen_height / 2;
    this.root.y0 = this.screen_width / 2;
    // overwrite dag root nodes to set only one
    // this.dag['dagRoots'] = [this.root];

    // draw dag
    this.update(this.root);
    // this.update(this.dag);
  }

  /**
   *
   * @param dag
   */
  decrossCouples(dag: Node[][]) {
    // Create a hashmap of dag array
    let dagHashMap: { [id: string]: Node } = {};

    // Create arrays of spouses
    const groupSpouses = (dagRow: Node[]) => {
      let multiplesSpouses: string[][] = [];
      let spouses: Map<string, Node[]> = new Map();

      if (dagRow[0].data.isUnion) {
        // Unions
        for (let i = 0; i < dagRow.length; i++) {
          const union = dagRow[i];
          // add the unions to the nodes hashmap
          dagHashMap[union.data.id] = union;
        }
        return dagRow;
      } else {
        // Spouses
        for (let i = 0; i < dagRow.length; i++) {
          const person = dagRow[i];
          // add the person to the nodes hashmap
          dagHashMap[person.data.id] = person;

          if (
            !person.data.hasOwnProperty('own_unions') ||
            person.data?.own_unions.length === 0
          ) {
            // Single. create his own group. the key is his id
            spouses.set(person.data.id, [person]);
          } else {
            // Not single. Create his group if non existent the key is the union
            const key = person.data.own_unions.sort()[0];

            if (person.data.own_unions.length > 1) {
              // Have multiple spouses. Mark it to merge them all later
              multiplesSpouses.push(person.data.own_unions);
            }

            if (spouses.has(key)) {
              let existingPartners = spouses.get(key);
              existingPartners.push(person);

              spouses.set(key, existingPartners);
            } else {
              spouses.set(key, [person]);
            }
          }
        }

        // Merge multiples spouses into the first
        for (let i = 0; i < multiplesSpouses.length; i++) {
          const multiple = multiplesSpouses[i];
          const key = multiplesSpouses[i][0];

          for (let j = 1; j < multiplesSpouses[i].length; j++) {
            const otherKey = multiplesSpouses[i][j];
            const allPartners = spouses.get(key).concat(spouses.get(otherKey));
            spouses.set(key, allPartners);

            spouses.delete(otherKey);
          }
        }

        return [...spouses.values()];
      }
    };

    let unionsOrder: string[][] = [];
    for (let i = 0; i < dag.length; i++) {
      let row = dag[i];

      // Bucket sort
      // SET UP an array of initially empty "buckets": spouses.
      // SCATTER each object from the unsorted array into their corresponding buckets.
      let spouses: any = groupSpouses(row);

      // SORT each bucket individually.
      if (Array.isArray(spouses[0])) {
        // Spouses sorted by the one with many partners
        spouses.sort((a: Node[], b: Node[]) => {
          return a.length > b.length ? -1 : 1;
        });

        // Get the order of their unions to sort the next layer
        unionsOrder[i] = spouses
          .map((s) => {
            return s.map((p) => p.data?.own_unions).flat();
          })
          .flat();
        // Deduplicate the unions order
        unionsOrder[i] = [...new Set(unionsOrder[i])];
      } else {
        // For unions, we set them in the order of the unionsOrder[i-1]
        spouses = unionsOrder[i - 1].map((unionId) => dagHashMap[unionId]);
      }

      // GATHER items from each bucket in their correct order
      dag[i] = spouses.flat();
    }
  }

  update(source: any) {
    // Assigns the x and y position for the nodes
    let dag_tree = this.layout(this.dag);

    let nodes = this.dag.descendants();
    let links = this.dag.links();

    // *********************************************
    //             Nodes section
    // *********************************************
    // Update the nodes...
    let node = this.g.selectAll('g.node').data(nodes, (d: any, index) => {
      if (!d.data.id) {
        this.i = this.i + 1;
        d.data.id = this.i;
      }

      // Swap coordinates to make the graph vertical
      const tempX = d.x;
      d.x = d.y;
      d.y = tempX;

      return d.data.id;
      // return d.data.id || (d.data.id = this.i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => {
        return 'translate(' + d.y + ',' + d.x + ')'; // his own position
        // return 'translate(' + source.y0 + ',' + source.x0 + ')'; // parent position
      })
      // .on('click', this.expandNode)
      .on('click', this.onPersonClick)
      // .on('mouseover', tip.show)
      // .on('mouseout', tip.hide)
      .attr('visible', true);

    // Add Rectangle for the nodes
    nodeEnter
      .append('rect')
      .attr('class', 'node')
      .attr('x', -(this.x_sep / 2))
      .attr('y', -(this.y_sep / 2))
      .attr('width', (d: Node) =>
        d.data.isUnion ? this.unionXSep : this.x_sep
      )
      .attr('height', (d: Node) =>
        d.data.isUnion ? this.unionYSep : this.y_sep
      );
    // .style('fill', 'red');
    // .style('fill', (d: any) => {
    //   return this.is_extendable(d) ? 'lightsteelblue' : '#fff';
    // });

    // Add Circle for the nodes
    // nodeEnter
    //   .append('circle')
    //   .attr('class', 'node')
    //   .attr('r', 10)
    //   .style('fill', '#fff');
    // // .style('fill', (d: any) => {
    // //   return this.is_extendable(d) ? 'lightsteelblue' : '#fff';
    // // });

    // Add names as node labels
    nodeEnter
      .append('text')
      .attr('dy', '-5')
      .attr('x', 13)
      .attr('dx', -(this.x_sep / 3))
      .attr('text-anchor', 'start')
      .text((d: any) => d.data.name);
    // add birth date and death date as labels
    nodeEnter
      .append('text')
      .attr('dy', '15')
      .attr('x', 13)
      .attr('dx', -(this.x_sep / 3))
      .attr('text-anchor', 'start')
      .text(function (d: Node) {
        if (d.data.isUnion) {
          return '';
        }
        return (d.data.birthyear || '?') + ' - ' + (d.data.deathyear || '?');
      });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    // nodeUpdate
    //   .transition()
    //   .duration(this.duration)
    //   .attr('transform', function (d: any) {
    //     return 'translate(' + d.y + ',' + d.x + ')';
    //   });

    // Hide the union nodes
    nodeUpdate
      .select('circle.node')
      .attr('r', (d: Node) => (d.data.isUnion ? 10 : 10)) // (d.data.isUnion ? 0 : 10))
      .attr('cursor', 'pointer');
    nodeUpdate
      .select('rect.node')
      .attr('width', (d: Node, i: any, nodes: any) => {
        // return d.data.isUnion ? 0 : this.x_sep;
        return d.data.isUnion ? 0 : this.x_sep;
      })
      .attr('cursor', 'pointer');

    // Remove any exiting nodes
    // var nodeExit = node
    //   .exit()
    //   .transition()
    //   .duration(this.duration)
    //   .attr('transform', function (d: any) {
    //     return 'translate(' + source.y + ',' + source.x + ')';
    //   })
    //   .attr('visible', false)
    //   .remove();

    // On exit reduce the node circles size to 0
    // nodeExit.select('circle').attr('r', 1e-6);

    // // On exit reduce the opacity of text labels
    // nodeExit.select('text').style('fill-opacity', 1e-6);

    // *********************************************
    //             links section
    // *********************************************

    // Update the links...
    var link = this.g.selectAll('path.link').data(links, function (d: any) {
      return d.source.data.id + d.target.data.id;
    });

    // Enter any new links at the parent's previous position.
    var linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        let o = { x: source.x0, y: source.y0 };
        return this.drawPath(o, o);
      });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(this.duration)
      .attr('d', (d: LayoutLink<Node>) => {
        return this.drawPath(d.source, d.target);
      });

    // Remove any exiting links
    // var linkExit = link
    //   .exit()
    //   .transition()
    //   .duration(this.duration)
    //   .attr('d', function (d: any) {
    //     var o = { x: source.x, y: source.y };
    //     return this.drawPath(o, o);
    //   })
    //   .remove();

    // expanding a big subgraph moves the entire dag out of the window
    // to prevent this, cancel any transformations in y-direction
    // Center the graph to the start person
    this.svg
      .transition()
      .duration(this.duration)
      .call(
        this.zoom.transform,
        d3
          .zoomTransform(this.g.node())
          .translate(-(source.y - source.y0), -(source.x - source.x0))
      );

    // Store the old positions for transition.
    nodes.forEach(function (d: any) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  /**
   * Creates a path from parent to the child nodes
   * @param s
   * @param d
   * @returns SVG path instructions
   */
  drawPath(s: Node | Coordinates, d: Node | Coordinates) {
    // By default the link start from the middle of the node/union
    let sourceX = s.x;
    let sourceY = s.y;
    let destX = d.x;
    let destY = d.y;
    let path: string;

    // Parent -> union
    if (s.hasOwnProperty('data') && !s['data']['isUnion']) {
      // for left node add a margin to the top
      sourceX = s.x;
      if (s.y > d.y) {
        // Start line at left for right node
        sourceY =
          s.y - this.y_sep - this.nodesSpacing / 3 - this.margingAroundNodes;
      } else {
        // Start line from right of left node
        sourceY =
          s.y + this.y_sep + this.nodesSpacing / 3 + this.margingAroundNodes;
      }

      // Straight horizontal line between spouses
      path = `M ${sourceY} ${sourceX}
              L ${destY} ${sourceX}`;
    }
    // Union -> Child
    if (d.hasOwnProperty('data') && !d['data']['isUnion']) {
      // for destination node add a margin to the bottom
      destX =
        d.x - this.x_sep / 10 - this.nodesSpacing / 2 - this.margingAroundNodes;
      destY = d.y;

      sourceX = d.x - this.x_sep - this.nodesSpacing / 3;

      // Angular lines
      path = `M ${sourceY} ${sourceX}
              L ${sourceY} ${s.x}
                ${destY} ${s.x}
                ${destY} ${destX}`;
    }

    // Curved lines
    // path = `M ${s.y} ${s.x}
    //   C ${(s.y + d.y) / 2} ${s.x},
    //     ${(s.y + d.y) / 2} ${d.x},
    //     ${d.y} ${d.x}`;

    return path;
  }

  /********************************************
   *          Helper functions
   ********************************************/
  onPersonClick = (event: any, d: Node) => {
    // do nothing if node is union
    if (d.data.isUnion) return;

    console.log('Clicked on:', d.data.name);
  };

  /**
   * Toggle unions, children, partners on click.
   * Defined as an arrow function to give access to `this` context
   * @param event
   * @param d
   * @returns
   */
  expandNode = (event: any, d: Node) => {
    // do nothing if node is union
    if (d.data.isUnion) return;
    // uncollapse if there are uncollapsed unions / children / partners

    console.log(this.is_extendable(d));
    if (this.is_extendable(d)) {
      this.uncollapse(d);
    } else {
      // collapse if fully uncollapsed
      this.collapse(d);
    }
    this.update(d);
  };

  // collapse a node
  collapse(d: Node) {
    // remove root nodes and circle-connections
    let remove_inserted_root_nodes = (n: Node) => {
      console.log('COLLAPSING', n);
      // remove all inserted root nodes
      this.dag['dagRoots'] = this.dag['dagRoots'].filter(
        // this.dag.children = this.dag.children.filter(
        (c: Node) =>
          n.inserted_roots.find((r) => c.data.id === r.data.id) !== undefined
      );

      // remove inserted connections
      n.inserted_connections.forEach((arr: [LinkDatum, LinkDatum]) => {
        // check existence to prevent double entries
        // which will cause crashes
        const connectionExist = arr[0].child.children.find(
          (c) => arr[1].child.data.id === c.child.data.id
        );

        // if (arr[0].children.includes(arr[1])) {
        if (connectionExist) {
          arr[0].child.dataChildren.push(arr[1]);
          arr[0].child.children.remove(arr[1]);
        }
      });
      // repeat for all inserted nodes
      n.inserted_nodes.forEach(remove_inserted_root_nodes);
    };
    remove_inserted_root_nodes(d);

    // collapse neighbors which are visible and have been inserted by this node
    var vis_inserted_neighbors = d.neighbors.filter((n: Node) => {
      const isInserted = d.inserted_nodes.find(
        (a: Node) => a.data.id === n.data.id
      );

      return n.visible && isInserted;
      // d.inserted_nodes.includes(n)
    });
    vis_inserted_neighbors.forEach((n: any) => {
      // tag invisible
      n.visible = false;
      // if child, delete connection
      if (d.children.includes(n)) {
        d.dataChildren.push(n);
        d.children.remove(n);
      }
      // if parent, delete connection
      if (n.children.includes(d)) {
        n.dataChildren.push(d);
        n.children.remove(d);
      }
      // if union, collapse the union
      if (n.data.isUnion) {
        this.collapse(n);
      }
      // remove neighbor handle from clicked node
      d.inserted_nodes.remove(n);
    });
  }

  // uncollapse a node
  uncollapse(d: Node, make_roots = false) {
    if (d === undefined) return;

    // neighbor nodes that are already visible (happens when
    // circles occur): make connections, save them to
    // destroy / rebuild on collapse
    let extended_neighbors = d.neighbors.filter((n: any) => n.visible);
    extended_neighbors.forEach((n: any) => {
      // if child, make connection
      const isChild = d.dataChildren.find((c) => n.data.id === c.child.data.id);
      if (isChild) {
        d.inserted_connections.push([d, n]);
      }
      // if parent, make connection
      const isParent = n.dataChildren.find(
        (c) => d.data.id === c.child.data.id
      );
      if (isParent) {
        d.inserted_connections.push([n, d]);
      }
    });

    // neighbor nodes that are invisible: make visible, make connections,
    // add root nodes, add to inserted_nodes
    let collapsed_neighbors = d.neighbors.filter((n: any) => !n.visible);

    collapsed_neighbors.forEach((n, index: number) => {
      // collect neighbor data
      n.neighbors = this.getNeighbors(n);

      // tag visible
      n.visible = true;

      // if child, make connection
      const isChild = d.dataChildren.find((c) => n.data.id === c.child.data.id);
      if (isChild) {
        // d.children.push(n);
        d.children.push(isChild);
        d.dataChildren.remove(n);
      }

      // if parent, make connection
      const isParent = n.dataChildren.find(
        (c) => d.data.id === c.child.data.id
      );
      if (isParent) {
        n.children.push(isParent);
        n.dataChildren.remove(d);
        // insert root nodes if flag is set
        if (make_roots && !d.inserted_roots.includes(n)) {
          d.inserted_roots.push(n);
        }
      }
      // if union, uncollapse the union
      if (n.data.isUnion) {
        this.uncollapse(n, true);
      }
      // save neighbor handle in clicked node
      d.inserted_nodes.push(n);

      collapsed_neighbors[index] = n; // ??
    });

    // make sure this step is done only once
    if (!make_roots) {
      var add_root_nodes = (n: any) => {
        // add previously inserted root nodes (partners, parents)
        n.inserted_roots.forEach((p: any) => this.dag['dagRoots'].push(p));

        // add previously inserted connections (circles)
        n.inserted_connections.forEach((arr: any) => {
          // check existence to prevent double entries
          // which will cause crashes
          if (arr[0].dataChildren.includes(arr[1])) {
            arr[0].children.push(arr[1]);
            arr[0].dataChildren.remove(arr[1]);
          }
        });
        // repeat with all inserted nodes
        n.inserted_nodes.forEach(add_root_nodes);
      };
      add_root_nodes(d);
    }
  }

  is_extendable(node: Node) {
    return node.neighbors.filter((n: any) => !n.visible).length > 0;
  }

  getNeighbors(node: Node) {
    if (node.data.isUnion) {
      return this.getChildren(node).concat(this.getPartners(node));
    } else {
      return this.getOwnUnions(node).concat(this.getParentUnions(node));
    }
  }

  getParentUnions(node: Node) {
    if (node === undefined || node.data.isUnion) {
      return [];
    }

    var u_id = node.data.parent_union;
    if (u_id) {
      var union = this.all_nodes.find((n: any) => n.data.id == u_id);
      return [union].filter((u) => u != undefined);
    } else return [];
  }

  getParents(node: any) {
    var parents: any = [];
    if (node.data.isUnion) {
      node.data.partner.forEach((p_id: any) =>
        parents.push(this.all_nodes.find((n: any) => n.data.id == p_id))
      );
    } else {
      var parent_unions = this.getParentUnions(node);
      parent_unions.forEach(
        (u) => (parents = parents.concat(this.getParents(u)))
      );
    }
    return parents.filter((p: any) => p != undefined);
  }

  getOtherPartner(node: any, union_data: any) {
    var partner_id = union_data.partner.find(
      (p_id: any) => p_id != node.data.id && p_id != undefined
    );
    return this.all_nodes.find((n: any) => n.data.id == partner_id);
  }

  getPartners(node: any) {
    var partners: any = [];
    // return both partners if node argument is a union
    if (node.data.isUnion) {
      node.data.partner.forEach((p_id: any) =>
        partners.push(this.all_nodes.find((n: any) => n.data.id == p_id))
      );
    }
    // return other partner of all unions if node argument is a person
    else {
      var own_unions = this.getOwnUnions(node);
      own_unions.forEach((u: any) => {
        partners.push(this.getOtherPartner(node, u.data));
      });
    }
    return partners.filter((p: any) => p != undefined);
  }

  getOwnUnions(node: Node) {
    if (node.data.isUnion) {
      return [];
    }

    let unions: any = [];
    node.data.own_unions.forEach((u_id: any) =>
      unions.push(this.all_nodes.find((n: any) => n.data.id == u_id))
    );

    return unions.filter((u: any) => u !== undefined);
  }

  getChildren(node: Node): LinkDatum[] {
    let children: LinkDatum[] = [];
    if (!node.data.isUnion) {
      children = node.children.concat(node.dataChildren);
    } else {
      let own_unions = this.getOwnUnions(node);

      own_unions.forEach(
        (u: any) => (children = children.concat(this.getChildren(u)))
      );
    }
    // sort children by birth year, filter undefined
    children = children
      .filter((c: any) => c != undefined)
      .sort((a: LinkDatum, b: LinkDatum) =>
        Math.sign(
          (this.getBirthYear(a.child) || 0) - (this.getBirthYear(b.child) || 0)
        )
      );

    return children;
  }

  getBirthYear(node: Node) {
    return new Date(node.data.birthyear || NaN).getFullYear();
  }

  getDeathYear(node: any) {
    return new Date(node.data.deathyear || NaN).getFullYear();
  }

  find_path(n: any) {
    let parents = this.getParents(n);
    let found = false;
    let result: any = []; // null;
    parents.forEach((p: any) => {
      if (p && !found) {
        if (p.id == 'profile-89285291') {
          found = true;
          result = [p, n];
        } else {
          result = this.find_path(p);
          if (result) {
            found = true;
            result.push(n);
          }
        }
      }
    });
    return result;
  }
}
