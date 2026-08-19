"use client"

import { StoryEdge, StoryNode } from "@/types";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, EdgeChange, NodeChange, OnSelectionChangeParams } from "@xyflow/react";
import { useCallback } from "react";
import useStoryData from "./useStoryData";
import usePanelContent from "./usePanelContent";

export default function useEditorCallbacks(
    storyData: ReturnType<typeof useStoryData>,
    panelContent: ReturnType<typeof usePanelContent>,
    setIsSaved: (value: boolean) => void
) {
    const onBeforeDelete = useCallback(
        async ({nodes, edges}: { nodes: StoryNode[], edges: StoryEdge[] })  => {
            if (!nodes.length && !edges.length) return false;
            const confirmation = window.confirm(
                `You are about to delete ${nodes.length ? `${nodes.length} node(s)` : ''}${nodes.length > 0 && edges.length > 0 ? ' and ' : ''}${edges.length ? `${edges.length} edge(s)` : ''}. Do you confirm ?`
            )
            return confirmation;
        }, []
    );

    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
            if (selectedNodes.length > 0 || selectedEdges.length > 0) panelContent.setCurrentId(selectedNodes.at(0)?.id ?? selectedEdges.at(0)?.id);
            else panelContent.setCurrentId(undefined);
        }, [panelContent]
    );

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            storyData.setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot) as StoryNode[])
            setIsSaved(false);
        }, [storyData, setIsSaved]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            storyData.setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot) as StoryEdge[])
            setIsSaved(false);
        }, [storyData, setIsSaved]
    );

    const onConnect = useCallback((params: Connection) => {
            storyData.setEdges((edgesSnapshot) => addEdge({ ...params, data: { conditionGroups: [], assignments: [] } }, edgesSnapshot) as StoryEdge[])
            setIsSaved(false);
        }, [storyData, setIsSaved]
    );

    return {
        onBeforeDelete,
        onSelectionChange,
        onNodesChange,
        onEdgesChange,
        onConnect
    }
}