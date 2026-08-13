"use client"

import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, NodeChange, OnSelectionChangeParams, ReactFlow, useReactFlow } from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import '@xyflow/react/dist/style.css';
import { ContentItem, NodeData, Story, StoryNode, Variable } from "@/types";
import VariablePanel from "@/components/VariablePanel";
import { Icon } from "@iconify/react";
import ContentPanel from "@/components/ContentPanel";
import StartNode from "@/components/nodes/StartNode";

const nodeTypes = {
    startNode: StartNode
}

export default function EditorPage() {
    const { id } = useParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [isSaved, setIsSaved] = useState<boolean>(true);
    const [story, setStory] = useState<Story | undefined>();
    const [nodes, setNodes] = useState<StoryNode[]>([]);
    const [currentNodeId, setCurrentNodeId] = useState<string|undefined>(undefined)
    const currentNode = nodes.find((n) => n.id === currentNodeId)
    const [edges, setEdges] = useState<Edge[]>([]);

    const [variables, setVariables] = useState<Variable[]>([])
    const [panel, setPanel] = useState<'state' | 'content' | 'hidden' | 'settings'>('state');

    useEffect(() => {
        startTransition(async () => {
            const res = await fetch(`/api/stories/${id}`);
            const data = await res.json();

            if (res.status !== 200) {
                router.push('/editor')
            } else {
                setStory(data.story);
                setNodes(data.story?.graph?.nodes ?? [
                    { id: 'n1', position: { x: 0, y: 0 }, type: 'startNode', data: { label: 'Noeud 1', content: [] }}
                ]);
                setEdges(data.story?.graph?.edges ?? []);
                setVariables(data.story.graph?.variables ?? [])
                setIsLoading(false)
            }
        })
    }, [id])

    //---------- NODE DATA ----------//
    const onDataChange = (field: keyof NodeData, value: string|ContentItem[]) => {
        setNodes((nodes) =>
            nodes.map((n) =>
                currentNode?.id === n.id
                    ? { ...n, data: { ...n.data, [field]: value}}
                    : n
            )
        );
        setIsSaved(false);
    }
    const onAddParagraph = () => {
        setNodes((nodes) =>
            nodes.map((n: StoryNode) =>
                currentNode?.id === n.id
                    ? { ...n, data: { ...n.data, content: [...n.data.content, { type: 'paragraph', content: '' }]}}
                    : n
            )
        );
        setIsSaved(false);
    }

    //---------- VARIABLE ----------//
    const onVariableChange = (index: number, field: keyof Variable, value: string | number | boolean) => {
        setVariables((vars) => vars.map((v, i) => i === index ? { ...v, [field]: value } : v));
        setIsSaved(false);
    }
    const onAddVariable = () => {
        setVariables((vars) => [
            ...vars,
            { label: '', type: 'text', value: '', visible: false}
        ]);
        setIsSaved(false);
    }
    const onRemoveVariable = (index: number) => {
        setVariables(variables.filter((_, i) => i !== index))
        setIsSaved(false);
    }

    //---------- FLOW ----------//
    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
            if (selectedNodes.length > 0) setCurrentNodeId(selectedNodes.at(0)?.id);
            else setCurrentNodeId(undefined);

            // TODO: EDGES
        }, []
    )
    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot) as StoryNode[])
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

    //---------- FUNCTIONS ----------//
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

    if (isLoading) return (<div></div>)

    return (
        <div className="relative">
            <header className="h-16 flex justify-between border-b px-4 bg-white">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl capitalize">{story?.title}</h1>
                    { !isSaved && <button onClick={save} className="btn-primary">Sauvegarder</button> }
                    { isSaved && <button className="font-bold text-gray-300 p-2">Sauvegardé</button>}
                </div>
            </header>

            {/* Main content : flow */}
            <div style={{ height: 'calc(100vh - 4rem)' }} className="text-black">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}
                />
            </div>

            <div style={{ height: 'calc(100vh - 4rem)'}} className={`border-l absolute bg-white h-full top-16 right-0 ${panel === 'hidden' ? 'w-0': 'w-130 p-2'}`}>
                {/* Toggle panel */}
                <button
                    onClick={() => setPanel(panel === 'hidden' ? 'settings' : 'hidden')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex top-0 -left-8 bg-blue-500 w-8 h-8`}
                >
                    <Icon icon={panel === 'hidden' ?  "mdi:arrow-left" : "mdi:arrow-right"} className="size-6"/>
                </button>
                {/* Open story content panel : paragraph, image, sound */}
                <button
                    onClick={() => setPanel('content')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex  top-8 -left-8 ${panel === 'content' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:file-document-outline" className="size-6"/>
                </button>
                {/* Open story state panel : variables */}
                <button
                    onClick={() => setPanel('state')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex  top-16 -left-8 ${panel === 'state' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:cube-outline" className="size-6"/>
                </button>
                {/* Open story settings : page customization, metadata */}
                <button
                    onClick={() => setPanel('settings')}
                    className={`border-b border-l cursor-pointer absolute items-center justify-center flex  top-24 -left-8 ${panel === 'settings' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:settings-outline" className="size-6"/>
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
                    panel === 'content' &&
                        <ContentPanel
                            node={currentNode}
                            onDataChange={onDataChange}
                            onAddParagraph={onAddParagraph}
                        />
                }
                {
                    panel === 'settings' &&
                        <p className="text-center font-bold text-xl mb-8">Story Settings</p>
                }
            </div>
        </div>
    )
}