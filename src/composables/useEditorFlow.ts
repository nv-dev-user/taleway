"use client"

import { StoryNode } from "@/types";
import { useReactFlow } from "@xyflow/react";
import { useRef, useState } from "react";
import useStoryData from "./useStoryData";

export default function useEditorFlow(storyData: ReturnType<typeof useStoryData>) {
    const { screenToFlowPosition } = useReactFlow();

    const [pendingNode, setPendingNode] = useState<'pageNode' | 'endNode' | null>(null);
    const [ghostPosition, setGhostPosition] = useState<{ x: number, y: number } | null>(null);
    const flowWrapperRef = useRef<HTMLDivElement>(null);

    const onAddPageNode = () => {
        setPendingNode(prev => prev === 'pageNode' ? null : 'pageNode')
    }
    const onAddEndNode = () => {
        setPendingNode(prev => prev === 'endNode' ? null : 'endNode')
    }
    const onPaneMouseMove = (event: React.MouseEvent) => {
        if (!pendingNode) return
        const bounds = flowWrapperRef.current?.getBoundingClientRect()
        if (!bounds) return
        setGhostPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top })
    }
    const onPaneClick = (event: React.MouseEvent) => {
        if (!pendingNode) return;

        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode: StoryNode = {
            id: crypto.randomUUID(),
            position,
            type: pendingNode,
            data: { label: '', content: [] }
        };

        storyData.setNodes((nds) => [...nds, newNode]);
        setPendingNode(null);
        setGhostPosition(null);
    }

    return {
        pendingNode,
        setPendingNode,
        ghostPosition,
        setGhostPosition,
        flowWrapperRef,
        // ---
        onAddPageNode,
        onAddEndNode,
        onPaneMouseMove,
        onPaneClick
    }
}