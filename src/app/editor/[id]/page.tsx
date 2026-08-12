"use client"

import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, Node, NodeChange, OnSelectionChangeParams, ReactFlow } from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import '@xyflow/react/dist/style.css';
import { Story } from "@/types";
import VariableNode from "@/components/VariableNode";

const nodeTypes = {
    variable: VariableNode
}

export default function EditorPage() {
    const { id } = useParams();

    const router = useRouter();

    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [story, setStory] = useState<Story | undefined>();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [currentNode, setCurrentNode] = useState<Node|undefined>(undefined)

    useEffect(() => {
        startTransition(async () => {
            const res = await fetch(`/api/stories/${id}`);
            const data = await res.json();

            if (res.status !== 200) {
                router.push('/editor')
            } else {
                setStory(data.story);
                setNodes(/* data.story?.graph?.nodes || */ [
                    { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1', content: "Hello [[Pseudo]]" } },
                    { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2', content: "Hello [[Pseudo]]" } },
                    { id: 'v1', position: { x:0, y: -100}, type: 'variable', data: { label: '', type: 'text', value: '' } },
                ]);
                setEdges(/* data.story?.graph?.edges || */ [{ id: 'n1-n2', source: 'n1', target: 'n2', label: 'Vers le nœud 2' }]);
            }
        })
    }, [id])

    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
            if (selectedNodes.at(0)?.type !== 'variable') {
                setCurrentNode(selectedNodes.at(0));
                return;
            }
            setCurrentNode(undefined);
        }, []
    )
    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot))
            setIsSaved(false);
        }, []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot))
            setIsSaved(false);
        }, []
    );
    const onConnect = useCallback((params: Connection) => {
            setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot))
            setIsSaved(false);
        }, []
    );

    const save = async () => {
        const res = await fetch(`/api/stories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: story?.title || '',
                nodes,
                edges,
            })
        })

        const data = await res.json()

        if (res.status !== 200) {
            console.error(res.status, data.message)
        } else {
            setIsSaved(true)
        }
    }

    return (
        <div className="relative">
            <header className="h-16 flex justify-between border-b px-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl capitalize">{story?.title}</h1>
                    { !isSaved && <button onClick={save} className="btn-primary">Sauvegarder</button> }
                    { isSaved && <button className="font-bold text-gray-300 p-2">Sauvegardé</button>}
                </div>
            </header>
            <div style={{ height: 'calc(100vh - 4rem)' }} className="text-black">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    fitView
                />
            </div>
            <div style={{ height: 'calc(100vh - 4rem)'}} className="absolute bg-white h-full w-90 top-16 right-0 p-2">
                { !currentNode && (<p>Select a node</p>)}
                { currentNode && (<p>{ currentNode.data.label as string }</p>)}
            </div>
        </div>
    )
}