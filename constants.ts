import { GraphData } from './types';

// Vibrant palette for distinguishing chapters/groups
export const PALETTE = [
  "#f43f5e", // Rose-500
  "#3b82f6", // Blue-500
  "#10b981", // Emerald-500
  "#f59e0b", // Amber-500
  "#8b5cf6", // Violet-500
  "#06b6d4", // Cyan-500
  "#ec4899", // Pink-500
  "#84cc16", // Lime-500
  "#6366f1", // Indigo-500
  "#f97316", // Orange-500
  "#14b8a6", // Teal-500
  "#d946ef", // Fuchsia-500
  "#eab308", // Yellow-500
  "#22c55e", // Green-500
  "#0ea5e9"  // Sky-500
];

export const getGroupColor = (group: string): string => {
  if (!group) return "#94a3b8"; // Default Slate
  
  let hash = 0;
  for (let i = 0; i < group.length; i++) {
    hash = group.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
};

export const INITIAL_GRAPH_DATA: GraphData = {
  nodes: [
    { id: "Glucose", group: "ตัวอย่าง", radius: 15 },
    { id: "Hexokinase", group: "ตัวอย่าง", radius: 10 },
    { id: "ATP", group: "ตัวอย่าง", radius: 8 },
    { id: "ADP", group: "ตัวอย่าง", radius: 8 },
    { id: "Glucose-6-P", group: "ตัวอย่าง", radius: 15 },
    { id: "Phosphoglucose Isomerase", group: "ตัวอย่าง", radius: 10 },
    { id: "Fructose-6-P", group: "ตัวอย่าง", radius: 15 },
    { id: "Phosphofructokinase", group: "ตัวอย่าง", radius: 10 },
    { id: "Fructose-1,6-BP", group: "ตัวอย่าง", radius: 16 },
    { id: "Mitochondria", group: "ตัวอย่าง", radius: 30 },
    { id: "Cytoplasm", group: "ตัวอย่าง", radius: 40 },
    { id: "Glycolysis", group: "ตัวอย่าง", radius: 25 },
  ],
  links: [
    { source: "Glucose", target: "Hexokinase", label: "substrate" },
    { source: "ATP", target: "Hexokinase", label: "cofactor" },
    { source: "Hexokinase", target: "Glucose-6-P", label: "product" },
    { source: "Hexokinase", target: "ADP", label: "product" },
    { source: "Glucose-6-P", target: "Phosphoglucose Isomerase", label: "substrate" },
    { source: "Phosphoglucose Isomerase", target: "Fructose-6-P", label: "product" },
    { source: "Fructose-6-P", target: "Phosphofructokinase", label: "substrate" },
    { source: "ATP", target: "Phosphofructokinase", label: "cofactor" },
    { source: "Phosphofructokinase", target: "Fructose-1,6-BP", label: "product" },
    { source: "Phosphofructokinase", target: "ADP", label: "product" },
    { source: "Glycolysis", target: "Cytoplasm", label: "location" },
    { source: "Glucose", target: "Cytoplasm", label: "location" },
    { source: "Mitochondria", target: "Cytoplasm", label: "location" }, 
  ]
};