import { SVG } from '@svgdotjs/svg.js'
import { Component, OnInit } from '@angular/core';

interface Row {
  members:Node[];
  children?:Row;
}

interface Node {
  label:string;
  img:string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'family-tree';

  private NODE_RADIUS = 80;
  private X_SPACING = 100;
  private Y_SPACING = 120;

  public ngOnInit():void {
    this.renderTree(SVG().addTo('#canvas').size(800, 800), this.fakeTree(), 0);
  }

  private renderTree(draw:any, tree:Row, y_index:number) {
    console.log('render row > ', tree.members);
    const rowSvgElements:any[] = []
    tree.members.forEach((m, i) => {
      rowSvgElements.push(this.renderNode(draw, m, i, y_index, !!tree.children));
    });
    if (!!tree.children) {
      this.drawRowConnector(draw, tree.children.members.length, y_index);
    }
    if (tree.children) {
      this.renderTree(draw, tree.children, y_index + 1);
    }
  }

  private renderNode(draw:any, node:Node, x_index:number, y_index:number, has_children:boolean): any {
    const x_w = this.X_SPACING * x_index;
    const y_w = this.Y_SPACING * y_index;
    if (y_index > 0) {
      // do not render connection for first row
      draw.line(
        x_w + this.NODE_RADIUS / 2, // x center line
        y_w, // top of circle + 20
        x_w + this.NODE_RADIUS / 2, // x center line
        y_w - 20) // top of circle + 20
        .stroke({ color: '#000', width: 4 });
    }
    if (has_children) {
      // do not render connection for last row
      draw.line(
        x_w + this.NODE_RADIUS / 2, // x center line
        y_w + this.NODE_RADIUS, // bottom of circle
        x_w + this.NODE_RADIUS / 2, // x center line
        y_w + this.NODE_RADIUS + 20) // bottom of circle + 20
        .stroke({ color: '#000', width: 4 });
    }
    draw.plain(node.label).x(x_index + (this.NODE_RADIUS * x_index)).y(this.NODE_RADIUS * (y_index + 1) + ((this.Y_SPACING - this.NODE_RADIUS) * y_index));
    return draw.circle(this.NODE_RADIUS)
      .x(this.X_SPACING * x_index)
      .y(this.Y_SPACING * y_index)
      .style(`background-image: url('${node.img}')`);
  }

  private drawRowConnector(draw:any, children_count:number, y_index:number): void {
    // line connection of children lines
    draw.line(
      this.NODE_RADIUS / 2,
      (this.NODE_RADIUS + 20) * (y_index + 1),
      this.NODE_RADIUS * children_count + 2,
      (this.NODE_RADIUS + 20) * (y_index + 1),
    ).stroke({ color: '#000', width: 4 });
  }

  private fakeTree(): Row {
    return {
      members: [{
        label: 'Mother',
        img: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
      }, {
        label: 'Father',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjlq5LuCeWG6UKQ9k91uOm36Mi0DeVJVxGAQ&usqp=CAU'
      }],
      children: {
        members: [{
          label: 'Child',
          img: 'https://static.boredpanda.com/blog/wp-content/uploads/2019/07/baby-portraits-teeth-added-coffee-creek-studio-amy-haehl-fb.png'
        }, {
          label: 'Child',
          img: 'https://static.boredpanda.com/blog/wp-content/uploads/2019/07/baby-portraits-teeth-added-coffee-creek-studio-amy-haehl-fb.png'
        }, {
          label: 'Child',
          img: 'https://static.boredpanda.com/blog/wp-content/uploads/2019/07/baby-portraits-teeth-added-coffee-creek-studio-amy-haehl-fb.png'
        }],
      }
    }
  }

}
