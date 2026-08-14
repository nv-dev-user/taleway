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

export interface StoryEdge extends Edge {
  data: EdgeData
}

export interface EdgeData {
  [key: string]: unknown
  conditionGroups: ConditionGroup[]
}

export interface ConditionGroup {
  conditions: Condition[]
}

export interface Condition {
  label: string,
  operation: '=='|'>='|'>'|'<='|'<'|'!='
  value: string
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
  nodes: StoryNode[];
  edges: StoryEdge[];
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