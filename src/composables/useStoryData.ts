"use client"

import { Story, StoryEdge, StoryNode, Variable } from "@/types"
import { useCallback, useMemo, useState } from "react"

const createDefaultNodes = (): StoryNode[] => [
    { id: crypto.randomUUID(), deletable: false, type: 'startNode', position: { x: 0, y: 0 }, data: { label: 'Start', content: [] } }
];

const createDefaultEdges = (): StoryEdge[] => []

export default function useStoryData() {
    const [story, setStory] = useState<Story|undefined>(undefined);
    const [nodes, setNodes] = useState<StoryNode[]>([]);
    const [edges, setEdges] = useState<StoryEdge[]>([]);
    const [variables, setVariables] = useState<Variable[]>([]);

    const save = useCallback(async (id: string) => {
        const res = await fetch(`/api/stories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: story?.title || '',
                nodes,
                edges,
                variables
            })
        });

        const data = await res.json();

        if (res.status !== 200) {
            console.error(res.status, data.message);
            return false;
        } else {
            return true;
        }
    }, [story, nodes, edges, variables])

    const load = useCallback(async (id: string) => {
        const res = await fetch(`/api/stories/${id}`);
        const data = await res.json();

        if (res.status !== 200) {
            return false;
        }

        setStory(data.story);
        setNodes(data.story.graph.nodes ?? createDefaultNodes());
        setEdges(data.story.graph.edges ?? createDefaultEdges());
        setVariables(data.story.graph.variables ?? []);
        return true;
    }, [])

    return useMemo(() => ({
        story,
        setStory,
        nodes,
        setNodes,
        edges,
        setEdges,
        variables,
        setVariables,
        // ---
        save,
        load
    }), [story, nodes, edges, variables, save, load])
}