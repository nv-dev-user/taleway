import { Edge, Node } from "@xyflow/react";

export interface Story {
  id: number,
  title: string,
  graph: GraphData,
  createdAt: number,
  updatedAt: number
}

export type VariableType = "text" | "boolean" | "number"

export interface VariableNodeData {
    label: string,
    type: VariableType,
    value: string | boolean | number
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  variables?: Variable[];
}

export interface GraphNode extends Node {
  data: {
    label: string,
  }
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  // ajouté plus tard : conditions
}

export interface Variable {
  id: string;
  name: string;
  type: "number" | "boolean" | "text";
  defaultValue: number | boolean | string;
  visible: boolean;
}