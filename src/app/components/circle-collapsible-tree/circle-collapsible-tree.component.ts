import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as dataJson from '../../flare.json';
import * as d3 from 'd3';

interface Node {
  children?: any;
  _children?: any;
  y0: string;
  x0: string;
  y: string;
  x: string;
}

interface Dot {
  id: any;
  _children: any;
  children: null;
  depth: any;
  data: { name: string | any[] };
}

@Component({
  selector: 'app-circle-collapsible-tree',
  templateUrl: './circle-collapsible-tree.component.html',
  styleUrls: ['./circle-collapsible-tree.component.scss'],
})
export class CircleCollapsibleTreeComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartElement!: ElementRef;
  public data: any = (dataJson as any).default;

  ngAfterViewInit(): void {
    this.renderTreeChart();
  }

  public renderTreeChart() {
    // Specify the charts’ dimensions. The height is variable, depending on the layout.
    const width: any = 928;
    const marginTop: any = 100;
    const marginRight: any = 10;
    const marginBottom: any = 10;
    const marginLeft: any = -40;
    let element: any = this.chartElement.nativeElement;

    // Rows are separated by dx pixels, columns by dy pixels. These names can be counter-intuitive
    // (dx is a height, and dy a width). This because the tree must be viewed with the root at the
    // “bottom”, in the data domain. The width of a column is based on the tree’s height.
    const root: any = d3.hierarchy(this.data);
    const dx = 10;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    // Define the tree layout and the shape for links.
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal: any = d3
      .linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    // Create the SVG container, a layer for the links and a layer for the nodes.
    const svg = d3
      .select(element)
      .append('svg')
      .attr('id', 'chart3svg')
      .attr('width', width)
      .attr('height', dx)
      .attr('viewBox', [-marginLeft, -marginTop, width, dx])
      .attr(
        'style',
        'max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;'
      );

    const gLink = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    const gNode = svg
      .append('g')
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all');

    function update(event: { altKey: any } | null, source: any) {
      const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore((node: Node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = right.x - left.x + marginTop + marginBottom;

      const viewBoxValues = [marginLeft, left.x - marginTop, width, height];
      const viewBoxString = viewBoxValues.join(' ');

      const transition: any = svg
        .transition()
        .duration(duration)
        .attr('height', height)
        .attr('viewBox', viewBoxString);

      if (window.ResizeObserver) {
        // If ResizeObserver is available, use null as the tween
        transition.tween('resize', null);
      } else {
        // If ResizeObserver is not available, define a custom tween
        transition.tween('resize', () => {
          return () => {
            svg.dispatch('toggle');
          };
        });
      }

      // Update the nodes…
      const node = gNode.selectAll('g').data(nodes, (d: any) => d.id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter: any = node
        .enter()
        .append('g')
        .attr('transform', (d: any) => `translate(${source.y0},${source.x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (event, d: any) => {
          d.children = d.children ? null : d._children;
          update(event, d);
        });

      nodeEnter
        .append('circle')
        .attr('r', 2.5)
        .attr('fill', (d: any) => (d._children ? '#555' : '#999'))
        .attr('stroke-width', 10);

      nodeEnter
        .append('text')
        .attr('dy', '0.31em')
        .attr('x', (d: any) => (d._children ? -6 : 6))
        .attr('text-anchor', (d: any) => (d._children ? 'end' : 'start'))
        .text((d: any) => d.data.name)
        .clone(true)
        .lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white');

      // Transition nodes to their new position.
      const nodeUpdate = node
        .merge(nodeEnter)
        .transition(transition)
        .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node
        .exit()
        .transition(transition)
        .remove()
        .attr('transform', (d: any) => `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      // Update the links…
      const link = gLink.selectAll('path').data(links, (d: any) => d.target.id);

      // Enter any new links at the parent's previous position.
      const linkEnter: any = link
        .enter()
        .append('path')
        .attr('d', (d: any) => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      // Transition links to their new position.
      link.merge(linkEnter).transition(transition).attr('d', diagonal);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr('d', (d: any) => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      // Stash the old positions for transition.
      root.eachBefore((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Do the first update to the initial configuration of the tree — where a number of nodes
    // are open (arbitrarily selected as the root, plus nodes with 7 letters).
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d: Dot, i: any) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });

    update(null, root);

    return svg.node();
  }
}
