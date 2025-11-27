import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  group: string; // Dynamic group name (e.g., "บทที่ 2", "AI Generated")
  radius?: number;
  description?: string; // For AI context
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number;
  label?: string; // Relationship text from curriculum data
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GenerationRequest {
  topic: string;
}