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
  assignments: Assignment[]
}

export interface Assignment {
  label: string
  operation: '=' | '+=' | '-='
  value: string
}

export interface Trigger {
  id: string
  conditionGroups: ConditionGroup[]
  actions: TriggerAction[]
}

export type TriggerAction =
  | { type: 'redirect'; target: string }
  | { type: 'assignment'; label: string; operation: '=' | '+=' | '-='; value: string }

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
  | { id: string; type: 'paragraph'; content: string }
  | { id: string; type: 'image'; content: string; alt?: string }
  | { id: string; type: 'sound'; content: string; loop?: boolean; isPlayed: boolean } // Always starts playing at page's entering

export interface GraphData {
  nodes: StoryNode[];
  edges: StoryEdge[];
  variables?: Variable[];
  triggers?: Trigger[];
}

export interface Variable {
  label: string;
  type: "number" | "boolean" | "text";
  value: number | boolean | string;
  visible: boolean;
}