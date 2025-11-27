import { GraphData, GraphNode, GraphLink } from '../types';

export interface RawNode {
  node: string;
  relation?: string;
  targets?: RawNode[];
  function?: string;
  function_targets?: RawNode[];
}

export interface ChapterData {
  chapter: string;
  title: string;
  sources: string;
  data: RawNode;
}

export function transformBiologyData(chapter: ChapterData): GraphData {
  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  function traverse(current: RawNode, parentId: string | null, depth: number, incomingRelation?: string) {
    const nodeId = current.node;

    if (!nodes.has(nodeId)) {
        // Use the Chapter ID as the group tag as requested
        const group = chapter.chapter; 

        // Keep visual hierarchy sizing despite uniform grouping
        // Root: 45, Level 1: 37, Level 2: 29, Level 3+: ~20-10
        const radius = Math.max(10, 45 - (depth * 8));

        nodes.set(nodeId, {
            id: nodeId,
            group: group,
            radius: radius,
            x: Math.random() * 800 - 400, // Wider initial scatter
            y: Math.random() * 800 - 400,
            description: current.relation ? `Relation: ${current.relation}` : undefined
        });
    }

    if (parentId) {
        // Avoid duplicate links
        const linkExists = links.some(l => 
            (l.source === parentId && l.target === nodeId) ||
            (l.source === nodeId && l.target === parentId)
        );
        if (!linkExists) {
            links.push({
                source: parentId,
                target: nodeId,
                label: incomingRelation // Add the relation text to the link
            });
        }
    }

    if (current.targets) {
        current.targets.forEach(t => traverse(t, nodeId, depth + 1, t.relation));
    }
    
    // Handle 'function' branches which often have a 'function_targets' array
    if (current.function_targets) {
        current.function_targets.forEach(t => traverse(t, nodeId, depth + 1, current.function || "function"));
    }
  }

  // Start traversal
  traverse(chapter.data, null, 0);

  return {
    nodes: Array.from(nodes.values()),
    links
  };
}