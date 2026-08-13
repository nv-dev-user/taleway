"use client"

import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, EdgeTypes, Node, NodeChange, NodeTypes, OnBeforeDelete, OnDelete, OnSelectionChangeParams, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import '@xyflow/react/dist/style.css';
import { ContentItem, NodeData, Story, StoryNode, Variable } from "@/types";
import VariablePanel from "@/components/VariablePanel";
import { Icon } from "@iconify/react";
import ContentPanel from "@/components/ContentPanel";
import StartNode from "@/components/nodes/StartNode";
import EndNode from "@/components/nodes/EndNode";
import PageNode from "@/components/nodes/PageNode";

const nodeTypes = {
    startNode: StartNode,
    pageNode: PageNode,
    endNode: EndNode
}

export default function EditorPage() {
    return (
        <ReactFlowProvider>
            <EditorFlow />
        </ReactFlowProvider>
    )
}

function EditorFlow() {
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
    const [pendingNode, setPendingNode] = useState<'pageNode' | 'endNode' | null>(null)
    const [ghostPosition, setGhostPosition] = useState<{ x: number, y: number } | null>(null)
    const [panel, setPanel] = useState<'state' | 'content' | 'hidden' | 'global-settings' | 'settings'>('content');

    const [askConfirm, setAskConfirm] = useState<boolean>(false);

    const flowWrapperRef = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    // ESC to cancel pending node
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && pendingNode) {
                setPendingNode(null)
                setGhostPosition(null)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [pendingNode])

    useEffect(() => {
        startTransition(async () => {
            const res = await fetch(`/api/stories/${id}`);
            const data = await res.json();

            if (res.status !== 200) {
                router.push('/editor')
            } else {
                setStory(data.story);
                setNodes(data.story?.graph?.nodes ?? [
                    { id: crypto.randomUUID(), deletable: false, position: { x: 0, y: 0 }, type: 'startNode', data: { label: 'Start', content: [] }},
                    { id: crypto.randomUUID(), position: { x: -100, y: 100 }, type: 'pageNode', data: { label: 'Page 1', content: [] }},
                    { id: crypto.randomUUID(), position: { x: 100, y: 100 }, type: 'pageNode', data: { label: 'Page 2', content: [] }},
                    { id: crypto.randomUUID(), position: { x: 0, y: 200 }, type: 'endNode', data: { label: 'Fin 1', content: [] }}
                ]);
                setEdges(data.story?.graph?.edges ?? []);
                setVariables(data.story.graph?.variables ?? [])
                setIsLoading(false)
            }
        })
    }, [id])

    //---------- NODE ----------//

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

        setNodes((nds) => [...nds, newNode]);
        setPendingNode(null);
        setGhostPosition(null);
        setIsSaved(false);
    }

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
    const onBeforeDelete = useCallback(
        async ({nodes, edges}: { nodes: StoryNode[], edges: Edge[] })  => {
            if (!nodes.length && !edges.length) return false;
            const confirmation = window.confirm(
                `You are about to delete ${nodes.length ? `${nodes.length} nodes` : ''}${nodes.length > 0 && edges.length > 0 ? 'and' : ''}${edges.length ? `${edges.length} edges` : ''}. Do you confirm ?`
            )

            return confirmation;
        }, []
    );
    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
            if (selectedNodes.length > 0) setCurrentNodeId(selectedNodes.at(0)?.id);
            else setCurrentNodeId(undefined);

            // TODO: EDGES
        }, []
    );
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

            <div className="z-10 absolute mt-2 ml-2 flex flex-col gap-2">
                <button
                    className={`active:bg-accent/80 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center ${pendingNode === 'pageNode' ? 'bg-blue-500' : 'bg-accent'}`}
                    onClick={() => onAddPageNode()}
                >
                    <Icon icon="mdi:file-document-outline" className="size-7 text-white" />
                </button>
                <button
                    className={`active:bg-accent/80 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center ${pendingNode === 'endNode' ? 'bg-blue-500' : 'bg-accent'}`}
                    onClick={() => onAddEndNode()}
                >
                    <Icon icon="fa:flag-checkered" className="size-6 text-white" />
                </button>
            </div>

            {/* Main content : flow */}
            <div ref={flowWrapperRef} style={{ height: 'calc(100vh - 4rem)' }} className={`text-black relative ${pendingNode ? '**:cursor-pointer!' : ''}`}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    onPaneClick={onPaneClick}
                    onPaneMouseMove={onPaneMouseMove}
                    deleteKeyCode={['Delete', 'Suppr']}
                    onBeforeDelete={onBeforeDelete}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}
                />

                {/* Ghost node preview following mouse */}
                {pendingNode && ghostPosition && (
                    <div
                        className="pointer-events-none absolute z-20 opacity-50"
                        style={{
                            left: ghostPosition.x,
                            top: ghostPosition.y,
                        }}
                    >
                        <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded flex items-center justify-center">
                            <Icon icon={pendingNode === 'pageNode' ? 'mdi:file-document-outline' : 'fa:flag-checkered'} className="size-6 text-blue-500" />
                        </div>
                    </div>
                )}
            </div>

            <div style={{ height: 'calc(100vh - 4rem)'}} className={`border-l absolute bg-white h-full top-16 right-0 ${panel === 'hidden' ? 'w-0': 'w-130 p-2'}`}>
                {/* Toggle panel */}
                <button
                    onClick={() => setPanel(panel === 'hidden' ? 'content' : 'hidden')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex top-0 -left-8 bg-blue-500 w-8 h-8`}
                >
                    <Icon icon={panel === 'hidden' ?  "mdi:arrow-left" : "mdi:arrow-right"} className="size-6"/>
                </button>
                {/* Open story content panel : paragraph, image, sound */}
                <button
                    onClick={() => setPanel('content')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex top-8 -left-8 ${panel === 'content' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="streamline-ultimate:content-paper-edit-bold" className="size-6"/>
                </button>
                <button
                    onClick={() => setPanel('settings')}
                    className={`border-l border-b cursor-pointer absolute items-center justify-center flex top-16 -left-8 ${panel === 'settings' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:tune-vertical" className="size-6"/>
                </button>

                {/* Open story state panel : variables */}
                <button
                    onClick={() => setPanel('state')}
                    className={`border-l border-t cursor-pointer absolute items-center justify-center flex  bottom-8 -left-8 ${panel === 'state' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:cube-outline" className="size-6"/>
                </button>
                {/* Open story settings : page customization, metadata */}
                <button
                    onClick={() => setPanel('global-settings')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex bottom-0 -left-8 ${panel === 'global-settings' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:settings-outline" className="size-6"/>
                </button>

                { panel === 'content' &&
                    <ContentPanel
                        node={currentNode}
                        onDataChange={onDataChange}
                        onAddParagraph={onAddParagraph}
                    />
                }
                { panel === 'settings' &&
                    <div>
                        <p>- Modifier couleur de fond</p>
                        <p>- Modifier couleur label</p>
                    </div>
                }

                { panel === 'state' &&
                    <VariablePanel
                        variables={variables}
                        onAddVariable={onAddVariable}
                        onRemoveVariable={onRemoveVariable}
                        onVariableChange={onVariableChange}
                    />
                }
                { panel === 'global-settings' &&
                    <div>
                        <p className="text-center font-bold text-xl mb-8">Story Settings</p>
                        <p>- Modifier titre</p>
                        <p>- Modifier couverture</p>
                        <br />
                        <p>Créé le {new Date(story?.createdAt ?? '').toLocaleString()}</p>
                        <p>Mis à jour le {new Date(story?.updatedAt ?? '').toLocaleString()}</p>
                    </div>
                }
            </div>
        </div>
    )
}