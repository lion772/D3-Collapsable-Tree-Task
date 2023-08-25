import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import * as dataJson from '../../flare.json';

interface Dot {
  children?: any;
  _children?: any;
  y0: string;
  x0: string;
  y: string;
  x: string;
}

interface Node {
  children: any[] | null;
  _children: any;
}

interface Source {
  y0: string;
  x0: string;
  y: string;
  x: string;
}

@Component({
  selector: 'app-collapsible-tree',
  templateUrl: './collapsible-tree.component.html',
  styleUrls: ['./collapsible-tree.component.scss'],
})
export class CollapsibleTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;
  data: any = (dataJson as any).default;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.renderTreeChart();
  }

  renderTreeChart() {
    let margin = { top: 30, right: 10, bottom: 30, left: 20 };
    let width = 960;
    let barHeight = 20;
    let barWidth = 100 * 0.8;
    let element: any = this.chartContainer.nativeElement;

    let i = 0,
      duration = 400,
      root: any;
    let diagonal = d3
      .linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    let svg = d3
      .select(element)
      .append('svg')
      .attr('width', element.offsetWidth) //+ margin.left + margin.right
      .attr('height', element.offsetHeight) // margin.top + margin.bottom
      .attr('id', 'chart3svg')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    root = d3.hierarchy(this.data);
    root.x0 = 0;
    root.y0 = 0;
    //collapseChildren(root);
    update(root);

    function update(source: Source) {
      // Compute the flattened node list.
      let nodes = root.descendants();
      console.log('nodes: ', nodes);

      let height = Math.max(
        500,
        nodes.length * barHeight * 2 + margin.top + margin.bottom
      );

      //console.log(nodes.length);
      d3.select('svg#chart3svg')
        .transition()
        .duration(duration)
        .attr('height', height);

      d3.select(self.frameElement)
        .transition()
        .duration(duration)
        .style('height', height + 'px');

      // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
      let index = -1;
      root.eachBefore(function (d: { depth: number; x: number; y: number }) {
        ++index;
        let setXAxis = index * barHeight * 2;

        if (d.depth > 0 && index > 0) {
          setXAxis = setXAxis - 40;
        }

        if (d.depth > 1 && index > 0) {
          setXAxis = setXAxis - 40;
        }

        if (d.depth > 2 && index > 0) {
          setXAxis = setXAxis - 40;
        }

        d.x = setXAxis;
        d.y = d.depth * 200;
      });

      // Update the nodes…
      let node = svg.selectAll('.node').data(nodes, function (d: any) {
        return d.id || (d.id = ++i);
      });

      let nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
          return 'translate(' + source.y0 + ',' + source.x0 + ')';
        })
        .style('opacity', 0);

      // Enter any new nodes at the parent's previous position.
      nodeEnter
        .append('rect')
        .attr('y', -barHeight / 2)
        .attr('height', barHeight)
        .attr('width', barWidth)
        .style('fill', color as any)
        .on('click', click);

      nodeEnter
        .append('text')
        .attr('dy', 5)
        .attr('dx', 5.5)
        .text(function (d: any) {
          return d.data.name;
        });

      // Transition nodes to their new position.
      nodeEnter
        .transition()
        .duration(duration)
        .attr('transform', function (d: any) {
          return 'translate(' + d.y + ',' + d.x + ')';
        })
        .style('opacity', 1);

      node
        .transition()
        .duration(duration)
        .attr('transform', function (d: any) {
          return 'translate(' + d.y + ',' + d.x + ')';
        })
        .style('opacity', 1)
        .select('rect')
        .style('fill', color as any);

      // Transition exiting nodes to the parent's new position.
      node
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', function (d: any) {
          return 'translate(' + source.y + ',' + source.x + ')';
        })
        .style('opacity', 0)
        .remove();

      // Update the links…
      var link = svg.selectAll('.link').data(root.links(), function (d: any) {
        return d.target.id;
      });

      // Enter any new links at the parent's previous position.
      link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', '2px')
        .attr('d', function (d) {
          var o = { x: source.x0, y: source.y0 };
          return diagonal(<any>{ source: o, target: o });
        })
        .transition()
        .duration(duration)
        .attr('d', diagonal as any);

      // Transition links to their new position.
      link
        .transition()
        .duration(duration)
        .attr('d', diagonal as any);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', function (d) {
          var o = { x: source.x, y: source.y };
          return diagonal(<any>{ source: o, target: o });
        })
        .remove();

      // Stash the old positions for transition.
      root.each(function (d: { x0: any; x: any; y0: any; y: any }) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Toggle children on click.
    function click(d: Dot) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      console.log('Clicked node: ', d);
      update(d);
    }

    function color(d: Dot) {
      return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c';
    }

    function collapseChildren(node: Node) {
      // https://stackoverflow.com/questions/19423396/d3-js-how-to-make-all-the-nodes-collapsed-in-collapsible-indented-tree
      if (node.children) {
        node.children.forEach((c) => collapseChildren(c));
        node._children = node.children;
        node.children = null;
      }
    }
  }
}
