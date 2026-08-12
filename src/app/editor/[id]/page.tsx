"use client"

import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, Node, NodeChange, ReactFlow, useReactFlow } from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import '@xyflow/react/dist/style.css';
import { Story, Variable } from "@/types";
import VariablePanel from "@/components/VariablePanel";
import { Icon } from "@iconify/react";

export default function EditorPage() {
    const { id } = useParams();
    const router = useRouter();

    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [story, setStory] = useState<Story | undefined>();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const [variables, setVariables] = useState<Variable[]>([])
    const [panel, setPanel] = useState<'state' | 'flow' | 'hidden'>('state');

    useEffect(() => {
        startTransition(async () => {
            const res = await fetch(`/api/stories/${id}`);
            const data = await res.json();

            if (res.status !== 200) {
                router.push('/editor')
            } else {
                setStory(data.story);
                setNodes(data.story?.graph?.nodes ?? []);
                setEdges(data.story?.graph?.edges ?? []);
                setVariables(data.story.graph?.variables ?? [])
            }
        })
    }, [id])

    const onVariableChange = (index: number, field: keyof Variable, value: string | number | boolean) => {
        setVariables((vars) => vars.map((v, i) => i === index ? { ...v, [field]: value } : v));
        setIsSaved(false);
    }
    const onAddVariable = () => {
        setVariables((vars) => [
            ...vars,
            { label: '', type: 'text', defaultValue: '', visible: false}
        ]);
        setIsSaved(false);
    }
    const onRemoveVariable = (index: number) => {
        setVariables(variables.filter((_, i) => i !== index))
    }

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
                variables,
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
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                />
            </div>

            { panel === 'hidden' &&
                <button
                    onClick={() => setPanel('flow')}
                    className={`border-l border-b cursor-pointer absolute items-center justify-center flex top-16 right-0 bg-blue-500 w-8 h-8`}
                >
                    <Icon icon="mdi:arrow-left" className="size-6"/>
                </button>
            }

            <div style={{ height: 'calc(100vh - 4rem)'}} className={`border-l absolute bg-white h-full w-100 top-16 right-0 p-2 ${panel === 'hidden' ? 'hidden': ''}`}>
                <button
                    onClick={() => setPanel('hidden')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex top-0 -left-8 bg-blue-500 w-8 h-8`}
                >
                    <Icon icon="mdi:arrow-right" className="size-6"/>
                </button>
                <button
                    onClick={() => setPanel('flow')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex  top-8 -left-8 ${panel === 'flow' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:transit-connection-variant" className="size-6"/>
                </button>
                <button
                    onClick={() => setPanel('state')}
                    className={`border-b border-l cursor-pointer absolute items-center justify-center flex  top-16 -left-8 ${panel === 'state' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:variable" className="size-6"/>
                </button>

                { panel === 'state' &&
                    <VariablePanel
                        variables={variables}
                        onAddVariable={onAddVariable}
                        onRemoveVariable={onRemoveVariable}
                        onVariableChange={onVariableChange}
                    />
                }
                {
                    panel === 'flow' &&
                        <p className="text-center font-bold text-xl">Story Flow</p>
                }
            </div>
        </div>
    )
}