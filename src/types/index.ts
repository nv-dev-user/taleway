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

export type ContentItem =
  | { type: 'paragraph'; content: string }
  | { type: 'image'; content: string; alt?: string }
  | { type: 'sound'; content: string; loop?: boolean }

export interface GraphData {
  nodes: StoryNode[];
  edges: StoryEdge[];
  variables?: Variable[];
}

export interface Variable {
  label: string;
  type: "number" | "boolean" | "text";
  value: number | boolean | string;
  visible: boolean;
}