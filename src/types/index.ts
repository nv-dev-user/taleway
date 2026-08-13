import { Edge, Node, NodeProps } from "@xyflow/react";

export interface Story {
  id: number,
  title: string,
  graph: GraphData,
  createdAt: number,
  updatedAt: number
}

export interface StoryNode extends Node {
  data: NodeData
}

export interface StoryNodeProps extends NodeProps {
  data: NodeData
}

export interface NodeData {
  [key: string]: unknown
  label: string
  content: ContentItem[]
}

export interface ContentItem {
  type: 'image' | 'sound' | 'paragraph'
  content: string
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
  label: string;
  type: "number" | "boolean" | "text";
  value: number | boolean | string;
  visible: boolean;
}