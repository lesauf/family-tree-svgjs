import {
  AfterViewInit,
  Component,
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
  LayoutDagRoot,
} from 'd3-dag/dist/dag/node';
import {
  sugiyama,
  SugiyamaLayout,
  SugiyamaOperator,
} from 'd3-dag/dist/sugiyama';
import { ConnectDatum } from 'd3-dag/dist/dag/connect';

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

export type Node = {
  data: {
    id: string | number;
    birthplace: string;
    birthyear: number;
    deathplace: string;
    deathyear: number;
    name: string;
    own_unions: any[];
    parent_union: string;
    isUnion: boolean;
  };
  // dataChildren: any[];
  dataChildren: LinkDatum[];
  children: LinkDatum[];
  height: any;
  inserted_nodes: Node[];
  inserted_roots: Node[];
  neighbors: Node[];
  visible: boolean;
  inserted_connections: any[];
};

@Component({
  selector: 'app-basic-d3',
  templateUrl: './basic-d3.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./basic-d3.component.scss'],
})
export class BasicD3Component implements AfterViewInit, OnInit {
  screen_width: any;
  screen_height: any;
  zoom: any;
  tree: any;
  dag: Dag<DagNode<ConnectDatum, string[]>>;
  root: any;
  duration: any;
  g: any;
  svg: any;
  all_nodes: any[];
  i: any;
  x_sep: number;
  y_sep: number;

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
    // helper variables
    this.i = 0;
    this.duration = 750;
    this.x_sep = 120;
    this.y_sep = 50;

    // declare a dag layout
    this.tree = d3.sugiyama().nodeSize((node) => [this.y_sep, this.x_sep]);

    this.tree
      // .nodeSize([this.y_sep, this.x_sep]);
      // .size([this.y_sep, this.x_sep])
      .layering(d3.layeringSimplex())
      .decross(d3.decrossOpt)
      .coord(d3.coordQuad); // .coordVert
    // this.tree.separation((a: any, b: any) => {
    //   return 1;
    // });

    // make dag from edge list
    this.dag = d3.dagConnect()(data.links);

    console.log('DAG:', this.dag);

    // in order to make the family tree work, the dag
    // must be a node with id undefined. create that node if
    // not done automaticaly
    // if (this.dag.data.id != undefined) {
    //   this.root = this.dag.copy();
    //   this.root.data.id = undefined;
    //   this.root.children = [this.dag];
    //   this.dag = this.root;
    // }
    // Populate node data
    this.all_nodes = this.dag.descendants();
    this.all_nodes = this.all_nodes.map((n: Node) => {
      n.data = data.persons[n.data.id]
        ? data.persons[n.data.id]
        : data.unions[n.data.id];
      // n.dataChildren = n.children; // all nodes collapsed by default
      // n.dataChildren = [];
      n.children = [];
      n.inserted_nodes = [];
      n.inserted_roots = [];
      n.neighbors = [];
      n.visible = false;
      n.inserted_connections = [];
      // n.height = 10;

      return n;
    });

    console.log('ALL_NODES: ', this.all_nodes);
    // find root node and assign data
    this.root = this.all_nodes.find(
      (n: { data: { id: string } }) => n.data.id == data.start
    );

    this.root.visible = true;
    this.root.neighbors = this.getNeighbors(this.root);
    this.root.x0 = this.screen_height / 2;
    this.root.y0 = this.screen_width / 2;
    // overwrite dag root nodes to set only one
    this.dag['dagRoots'] = [this.root];

    // draw dag
    this.update(this.root);
    // this.update(this.dag);
  }

  // collapse a node
  collapse(d: Node) {
    // remove root nodes and circle-connections
    var remove_inserted_root_nodes = (n: Node) => {
      // remove all inserted root nodes
      this.dag['dagRoots'] = this.dag['dagRoots'].filter(
        (c: Node) =>
          n.inserted_roots.find((r) => c.data.id === r.data.id) === undefined
      );

      // remove inserted connections
      n.inserted_connections.forEach((arr: [LinkDatum, LinkDatum]) => {
        // check existence to prevent double entries
        // which will cause crashes
        console.log('EXIST', arr[0]);
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

  getNeighbors(node: any) {
    if (node.data.isUnion) {
      return this.getChildren(node).concat(this.getPartners(node));
    } else {
      return this.getOwnUnions(node).concat(this.getParentUnions(node));
    }
  }

  getParentUnions(node: any) {
    if (node == undefined) return [];
    if (node.data.isUnion) return [];
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
    if (node.data.isUnion) return [];
    let unions: any = [];
    node.data.own_unions.forEach((u_id: any) =>
      unions.push(this.all_nodes.find((n: any) => n.data.id == u_id))
    );
    return unions.filter((u: any) => u != undefined);
  }

  getChildren(node: Node) {
    let children: any = [];
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
      .sort((a: any, b: any) =>
        Math.sign((this.getBirthYear(a) || 0) - (this.getBirthYear(b) || 0))
      );
    return children;
  }

  getBirthYear(node: any) {
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

  update(source: any) {
    // Assigns the x and y position for the nodes
    let dag_tree = this.tree(this.dag);
    // console.log('TREE', dag_tree);
    let nodes = this.dag.descendants();
    let links = this.dag.links();

    // console.log('NODES', nodes);

    // ****************** Nodes section ***************************

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s: any, d: any) {
      let path = `M ${s.y} ${s.x}
        C ${(s.y + d.y) / 2} ${s.x},
          ${(s.y + d.y) / 2} ${d.x},
          ${d.y} ${d.x}`;

      return path;
    }

    // Toggle unions, children, partners on click.
    let click = (event: any, d: any) => {
      // do nothing if node is union
      if (d.data.isUnion) return;

      // uncollapse if there are uncollapsed unions / children / partners
      if (this.is_extendable(d)) {
        this.uncollapse(d);
      } else {
        // collapse if fully uncollapsed
        this.collapse(d);
      }

      this.update(d);
    };

    // Update the nodes...
    let node = this.g.selectAll('g.node').data(nodes, (d: any) => {
      // console.log('I', (d.data.id = this.i));

      if (!d.data.id) {
        this.i = this.i + 1;
        d.data.id = this.i;
      }

      return d.data.id;
      // return d.data.id || (d.data.id = this.i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', click)
      // .on('mouseover', tip.show)
      // .on('mouseout', tip.hide)
      .attr('visible', true);

    // Add Circle for the nodes
    nodeEnter
      .append('circle')
      .attr('class', 'node')
      .attr('r', 10)
      .style('fill', (d: any) => {
        return this.is_extendable(d) ? 'lightsteelblue' : '#fff';
      });

    // Add names as node labels
    nodeEnter
      .append('text')
      .attr('dy', '-2')
      .attr('x', 13)
      .attr('text-anchor', 'start')
      .text((d: any) => d.data.name);
    // add birth date and death date as labels
    nodeEnter
      .append('text')
      .attr('dy', '10')
      .attr('x', 13)
      .attr('text-anchor', 'start')
      .text(function (d: any) {
        if (d.data.isUnion) {
          return '';
        }
        return (d.data.birthyear || '?') + ' - ' + (d.data.deathyear || '?');
      });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', function (d: any) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    // Update the node attributes and style
    nodeUpdate
      .select('circle.node')
      // .attr('r', (d: any) => 10 * !d.data.isUnion + 0 * d.data.isUnion)

      .attr('cursor', 'pointer');

    // Remove any exiting nodes
    var nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', function (d: any) {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .attr('visible', false)
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle').attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text').style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = this.g.selectAll('path.link').data(links, function (d: any) {
      return d.source.data.id + d.target.data.id;
    });

    // Enter any new links at the parent's previous position.
    var linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', function (d: any) {
        var o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(this.duration)
      .attr('d', (d: any) => diagonal(d.source, d.target));

    // Remove any exiting links
    var linkExit = link
      .exit()
      .transition()
      .duration(this.duration)
      .attr('d', function (d: any) {
        var o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    // expanding a big subgraph moves the entire dag out of the window
    // to prevent this, cancel any transformations in y-direction
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
}
