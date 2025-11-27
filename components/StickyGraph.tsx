import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink } from '../types';
import { getGroupColor } from '../constants';

interface StickyGraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

const StickyGraph: React.FC<StickyGraphProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.nodes.length) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a container group for zooming
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 4]) // Allow zooming out further
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Initial center positioning for the zoom container
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.35));

    // Clone data to avoid mutation issues in React strict mode
    const nodes = data.nodes.map(d => ({ ...d })) as GraphNode[];
    const links = data.links.map(d => ({ ...d })) as GraphLink[];

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-2000)) // Massive repulsion for "generous empty space"
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(250)) // Long links
      .force("center", d3.forceCenter(0, 0))
      .force("x", d3.forceX().strength(0.015)) // Gentle centering to keep graph from flying away
      .force("y", d3.forceY().strength(0.015))
      .on("tick", tick);

    // Link Lines
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .classed("link", true);

    // Link Labels (Relationships)
    const linkLabel = g.append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(links)
      .join("text")
      .text(d => d.label || "")
      .attr("font-size", 10)
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none")
      .style("font-weight", "500")
      .each(function(d) {
          // Add white outline for readability against lines
          const el = d3.select(this);
          el.clone(true)
            .lower()
            .attr("stroke", "#0f172a") // Match bg color for outline
            .attr("stroke-width", 4)
            .attr("stroke-linecap", "round");
      });

    // Nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.radius || 20)
      .attr("fill", d => getGroupColor(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.8)
      .classed("node", true)
      .classed("fixed", d => d.fx !== undefined);

    // Node Labels
    const label = g.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.id)
      .attr("font-size", d => Math.max(12, (d.radius || 12) / 1.5)) // Scale text with node size
      .attr("dx", d => (d.radius || 12) + 8)
      .attr("dy", 4)
      .attr("fill", "#e2e8f0")
      .style("pointer-events", "none")
      .style("text-shadow", "3px 3px 6px #000")
      .style("font-weight", "600");

    // --- Sticky Force Layout Logic ---

    function clamp(x: number, lo: number, hi: number) {
      return x < lo ? lo : x > hi ? hi : x;
    }

    function tick() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!)
        .classed("fixed", d => d.fx !== undefined && d.fx !== null);

      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    }

    function click(this: any, event: any, d: GraphNode) {
      delete d.fx;
      delete d.fy;
      d3.select(this).classed("fixed", false);
      simulation.alpha(1).restart();
      onNodeClick(d);
      event.stopPropagation();
    }

    function dragstart(this: any, event: any, d: GraphNode) {
      d3.select(this).classed("fixed", true);
      onNodeClick(d);
    }

    function dragged(event: any, d: GraphNode) {
      // Very large clamp buffer effectively allows free movement on the infinite canvas
      d.fx = clamp(event.x, -10000, 10000);
      d.fy = clamp(event.y, -10000, 10000);
      simulation.alpha(1).restart();
    }

    const drag = d3.drag<SVGCircleElement, GraphNode>()
      .on("start", dragstart)
      .on("drag", dragged);

    node.call(drag).on("click", click);

    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-950 overflow-hidden">
      <svg 
        ref={svgRef} 
        className="w-full h-full block"
        style={{ cursor: 'move' }}
      />
      <div className="absolute bottom-10 left-10 p-8 text-slate-400 text-sm pointer-events-none select-none bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl">
        <h3 className="font-bold text-slate-200 mb-4 text-lg">Interaction Guide</h3>
        <ul className="space-y-3 opacity-90">
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
            Drag nodes to lock position
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Click fixed nodes to release
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Scroll to zoom canvas
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StickyGraph;