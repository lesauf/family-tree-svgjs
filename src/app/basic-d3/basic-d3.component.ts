import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import 'd3-tip';
import * as d3dag from 'd3-dag';
import { data } from './data';
import { LayoutDagRoot } from 'd3-dag/dist/dag/node';
import { sugiyama, SugiyamaLayout, SugiyamaOperator } from 'd3-dag/dist/sugiyama';

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

@Component({
  selector: 'app-basic-d3',
  templateUrl: './basic-d3.component.html',
  styleUrls: ['./basic-d3.component.scss'],
})
export class BasicD3Component implements AfterViewInit, OnInit {
  screen_width: any;
  screen_height: any;
  zoom: any;
  tree: SugiyamaOperator<any>;
  dag: any;
  root: any;
  duration: any;
  g: any;
  svg: any;
  all_nodes: any;
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

    // initialize tooltips
    // var tip = d3
    //   .tip()
    //   .attr('class', 'd3-tip')
    //   .direction('e')
    //   .offset([0, 5])
    //   .html(function (d) {
    //     if (d.data.isUnion) return '';
    //     var content =
    //       `
    //               <span style='margin-left: 2.5px;'><b>` +
    //       d.data.name +
    //       `</b></span><br>
    //               <table style="margin-top: 2.5px;">
    //                       <tr><td>born</td><td>` +
    //       (d.data.birthyear || '?') +
    //       ` in ` +
    //       (d.data.birthplace || '?') +
    //       `</td></tr>
    //                       <tr><td>died</td><td>` +
    //       (d.data.deathyear || '?') +
    //       ` in ` +
    //       (d.data.deathplace || '?') +
    //       `</td></tr>
    //               </table>
    //               `;
    //     return content.replace(new RegExp('null', 'g'), '?');
    //   });

    // append the svg object to the body of the page
    // assigns width and height
    // activates zoom/pan and tooltips
    this.svg = d3
      .select('#graph')
      .append('svg')
      .attr('width', this.screen_width)
      .attr('height', this.screen_height)
      .call(this.zoom);
    // .call(tip);

    // append group element
    this.g = this.svg.append('g');

    // helper variables
    (this.i = 0), (this.duration = 750), (this.x_sep = 120), (this.y_sep = 50);

    // declare a dag layout
    this.tree = sugiyama();

    this.tree
      .nodeSize({sz: [this.y_sep, this.x_sep]})
      .layering(d3dag.layeringSimplex())
      .decross(d3dag.decrossOpt);

    // this.tree.coord(d3dag.coordCenter); // .coordVert
    // this.tree.separation((a: any, b: any) => {
    //   return 1;
    // });

    // make dag from edge list
    this.dag = d3dag.dagConnect()(data.links);

    // in order to make the family tree work, the dag
    // must be a node with id undefined. create that node if
    // not done automaticaly
    if (this.dag.id != undefined) {
      this.root = this.dag.copy();
      this.root.id = undefined;
      this.root.children = [this.dag];
      this.dag = this.root;
    }

    // prepare node data
    console.log(this.dag);
    this.all_nodes = this.dag.descendants();
    // console.log(this.all_nodes);

    this.all_nodes.forEach(
      (n: {
        data: any;
        id: string | number;
        _children: any;
        children: any[];
        inserted_nodes: any[];
        inserted_roots: any[];
        neighbors: any[];
        visible: boolean;
        inserted_connections: any[];
      }) => {
        n.data = data.persons[n.id] ? data.persons[n.id] : data.unions[n.id];
        n._children = n.children; // all nodes collapsed by default
        n.children = [];
        n.inserted_nodes = [];
        n.inserted_roots = [];
        n.neighbors = [];
        n.visible = false;
        n.inserted_connections = [];
      }
    );

    console.log(this.all_nodes);
    // find root node and assign data
    this.root = this.all_nodes.find((n: { id: string }) => n.id == data.start);

    this.root.visible = true;
    this.root.neighbors = this.getNeighbors(this.root);
    this.root.x0 = this.screen_height / 2;
    this.root.y0 = this.screen_width / 2;

    // overwrite dag root nodes
    this.dag.children = [this.root];

    // draw dag
    this.update(this.root);
  }

  // collapse a node
  collapse(d: any) {
    // remove root nodes and circle-connections
    var remove_inserted_root_nodes = (n: any) => {
      // remove all inserted root nodes
      this.dag.children = this.dag.children.filter(
        (c: any) => !n.inserted_roots.includes(c)
      );
      // remove inserted connections
      n.inserted_connections.forEach((arr: any) => {
        // check existence to prevent double entries
        // which will cause crashes
        if (arr[0].children.includes(arr[1])) {
          arr[0]._children.push(arr[1]);
          arr[0].children.remove(arr[1]);
        }
      });
      // repeat for all inserted nodes
      n.inserted_nodes.forEach(remove_inserted_root_nodes);
    };
    remove_inserted_root_nodes(d);

    // collapse neighbors which are visible and have been inserted by this node
    var vis_inserted_neighbors = d.neighbors.filter(
      (n: any) => n.visible & d.inserted_nodes.includes(n)
    );
    vis_inserted_neighbors.forEach((n: any) => {
      // tag invisible
      n.visible = false;
      // if child, delete connection
      if (d.children.includes(n)) {
        d._children.push(n);
        d.children.remove(n);
      }
      // if parent, delete connection
      if (n.children.includes(d)) {
        n._children.push(d);
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
  uncollapse(d: any, make_roots = false) {
    if (d == undefined) return;

    // neighbor nodes that are already visible (happens when
    // circles occur): make connections, save them to
    // destroy / rebuild on collapse
    var extended_neighbors = d.neighbors.filter((n: any) => n.visible);
    extended_neighbors.forEach((n: any) => {
      // if child, make connection
      if (d._children.includes(n)) {
        d.inserted_connections.push([d, n]);
      }
      // if parent, make connection
      if (n._children.includes(d)) {
        d.inserted_connections.push([n, d]);
      }
    });

    // neighbor nodes that are invisible: make visible, make connections,
    // add root nodes, add to inserted_nodes
    var collapsed_neighbors = d.neighbors.filter((n: any) => !n.visible);
    collapsed_neighbors.forEach((n: any) => {
      // collect neighbor data
      n.neighbors = this.getNeighbors(n);
      // tag visible
      n.visible = true;
      // if child, make connection
      if (d._children.includes(n)) {
        d.children.push(n);
        d._children.remove(n);
      }
      // if parent, make connection
      if (n._children.includes(d)) {
        n.children.push(d);
        n._children.remove(d);
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
    });

    // make sure this step is done only once
    if (!make_roots) {
      var add_root_nodes = (n: any) => {
        // add previously inserted root nodes (partners, parents)
        n.inserted_roots.forEach((p: any) => this.dag.children.push(p));
        // add previously inserted connections (circles)
        n.inserted_connections.forEach((arr: any) => {
          // check existence to prevent double entries
          // which will cause crashes
          if (arr[0]._children.includes(arr[1])) {
            arr[0].children.push(arr[1]);
            arr[0]._children.remove(arr[1]);
          }
        });
        // repeat with all inserted nodes
        n.inserted_nodes.forEach(add_root_nodes);
      };
      add_root_nodes(d);
    }
  }

  is_extendable(node: any) {
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
      var union = this.all_nodes.find((n: any) => n.id == u_id);
      return [union].filter((u) => u != undefined);
    } else return [];
  }

  getParents(node: any) {
    var parents: any = [];
    if (node.data.isUnion) {
      node.data.partner.forEach((p_id: any) =>
        parents.push(this.all_nodes.find((n: any) => n.id == p_id))
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
      (p_id: any) => p_id != node.id && p_id != undefined
    );
    return this.all_nodes.find((n: any) => n.id == partner_id);
  }

  getPartners(node: any) {
    var partners: any = [];
    // return both partners if node argument is a union
    if (node.data.isUnion) {
      node.data.partner.forEach((p_id: any) =>
        partners.push(this.all_nodes.find((n: any) => n.id == p_id))
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

  getOwnUnions(node: any) {
    if (node.data.isUnion) return [];
    let unions: any = [];
    node.data.own_unions.forEach((u_id: any) =>
      unions.push(this.all_nodes.find((n: any) => n.id == u_id))
    );
    return unions.filter((u: any) => u != undefined);
  }

  getChildren(node: any) {
    let children: any = [];
    if (node.data.isUnion) {
      children = node.children.concat(node._children);
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
    var dag_tree = this.tree(this.dag),
      nodes = this.dag.descendants(),
      links = this.dag.links();

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
    let click = (d: any) => {
      // do nothing if node is union
      if (d.data.isUnion) return;

      // uncollapse if there are uncollapsed unions / children / partners
      if (this.is_extendable(d)) this.uncollapse(d);
      // collapse if fully uncollapsed
      else this.collapse(d);

      this.update(d);
    };

    // Update the nodes...
    var node = this.g.selectAll('g.node').data(nodes, (d: any) => {
      return d.id || (d.id = ++this.i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function (d: any) {
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
      .attr('r', 1e-6)
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
      .style('fill', (d: any) => {
        return this.is_extendable(d) ? 'lightsteelblue' : '#fff';
      })
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
      return d.source.id + d.target.id;
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
