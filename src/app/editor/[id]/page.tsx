"use client"

import { isNode, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { useParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import '@xyflow/react/dist/style.css';
import { ConditionGroup, ContentItem, NodeData, StoryEdge, StoryNode, Variable } from "@/types";
import VariablePanel from "@/components/VariablePanel";
import { Icon } from "@iconify/react";
import StartNode from "@/components/nodes/StartNode";
import EndNode from "@/components/nodes/EndNode";
import PageNode from "@/components/nodes/PageNode";
import ContentPanel from "@/components/ContentPanel";
import useStoryData from "@/composables/useStoryData";
import useEditorCallbacks from "@/composables/useEditorCallbacks";

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

    const storyData = useStoryData()
    const {
        isSaved,
        setIsSaved,
        current,
        onBeforeDelete,
        onSelectionChange,
        onNodesChange,
        onEdgesChange,
        onConnect
    } = useEditorCallbacks(storyData);

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [pendingNode, setPendingNode] = useState<'pageNode' | 'endNode' | null>(null)
    const [ghostPosition, setGhostPosition] = useState<{ x: number, y: number } | null>(null)
    const [panel, setPanel] = useState<'state' | 'content' | 'hidden' | 'global-settings' | 'settings'>('content');

    const flowWrapperRef = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    //---------- FUNCTIONS ----------//

    // ESC to cancel pending node / Ctrl+S to save
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && pendingNode) {
                setPendingNode(null)
                setGhostPosition(null)
            }

            if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                storyData.save(id as string)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [pendingNode, storyData])

    useEffect(() => {
        startTransition(async () => {
            await storyData.load(id as string);
            setIsLoading(false);
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

        storyData.setNodes((nds) => [...nds, newNode]);
        setPendingNode(null);
        setGhostPosition(null);
        setIsSaved(false);
    }

    //---------- EDGE/NODE ----------//
    const onFieldChange = (field: keyof StoryEdge| keyof StoryNode, value: string) => {
        if (!current) return;

        if (isNode(current)) {
            storyData.setNodes((nodes) =>
                nodes.map((n) =>
                    n.id === current.id ? { ...n, [field as string]: value} : n
                )
            )
        } else {
            storyData.setEdges((edges) =>
                edges.map((e) =>
                    e.id === current.id ? { ...e, [field as string]: value} : e
                )
            )
        }

        setIsSaved(false);
    }

    //---------- EDGE ----------//
    const onAddGroup = () => {
        if (!current) return;

        storyData.setEdges((edges) =>
            edges.map((e) =>
                current?.id === e.id
                    ? { ...e, data: { conditionGroups: [...e.data.conditionGroups, { conditions: [] }]}}
                    : e
            )
        );
        setIsSaved(false);
    }
    const onAddCondition = (groupIndex: number) => {
        if (!current) return;
        const firstValidVariable = storyData.variables.filter((v) => v.label !== '').at(0);
        if (!firstValidVariable) return;

        storyData.setEdges((edges) =>
            edges.map((e) =>
                current?.id === e.id
                    ? { ...e, data: { conditionGroups: e.data.conditionGroups.map((g, gi) =>
                        gi === groupIndex
                            ? { ...g, conditions: [...g.conditions, { label: firstValidVariable.label, operation: '==', value: '' }]}
                            : g
                      )}}
                    : e
            )
        );
        setIsSaved(false);
    }
    const onRemoveGroup = (groupIndex: number) => {
        if (!current) return;
        storyData.setEdges((edges) =>
            edges.map((e) =>
                current?.id === e.id
                    ? { ...e, data: { conditionGroups: e.data.conditionGroups.filter((_, gi) => gi !== groupIndex) }}
                    : e
            )
        );
        setIsSaved(false);
    }
    const onRemoveCondition = (groupIndex: number, conditionIndex: number) => {
        if (!current) return;
        storyData.setEdges((edges) =>
            edges.map((e) =>
                current?.id === e.id
                    ? { ...e, data: { conditionGroups: e.data.conditionGroups.map((g, gi) =>
                        gi === groupIndex
                            ? { ...g, conditions: g.conditions.filter((_, ci) => ci !== conditionIndex) }
                            : g
                      )}}
                    : e
            )
        );
        setIsSaved(false);
    }

    //---------- NODE DATA ----------//
    const onDataChange = (field: keyof NodeData, value: string|ContentItem[]|ConditionGroup[]) => {
        if (!current) return;

        if(isNode(current)) {
            storyData.setNodes((nodes) =>
                nodes.map((n) =>
                    current?.id === n.id
                        ? { ...n, data: { ...n.data, [field]: value}}
                        : n
                )
            );
        } else {
            storyData.setEdges((edges) =>
                edges.map((e) =>
                    current?.id === e.id
                        ? { ...e, data: { ...e.data, [field]: value}}
                        : e
                )
            );
        }
        setIsSaved(false);
    }
    const onAddParagraph = () => {
        if (!current) return;

        storyData.setNodes((nodes) =>
            nodes.map((n: StoryNode) =>
                current?.id === n.id
                    ? { ...n, data: { ...n.data, content: [...n.data.content, { type: 'paragraph', content: '' }]}}
                    : n
            )
        );
        setIsSaved(false);
    }

    //---------- VARIABLE ----------//
    const onVariableChange = (index: number, field: keyof Variable, value: string | number | boolean) => {
        storyData.setVariables((vars) => vars.map((v, i) => i === index ? { ...v, [field]: value } : v));
        setIsSaved(false);
    }
    const onAddVariable = () => {
        storyData.setVariables((vars) => [
            ...vars,
            { label: '', type: 'text', value: '', visible: false}
        ]);
        setIsSaved(false);
    }
    const onRemoveVariable = (index: number) => {
        const variableToDelete = storyData.variables.filter((_, i) => i === index).at(0);
        if (!variableToDelete) return;

        storyData.setVariables(storyData.variables.filter((_, i) => i !== index))
        storyData.setEdges((edges) =>
            edges.map((e) => ({
                ...e,
                data: {
                    ...e.data,
                    conditions: e.data.conditionGroups.map((g) => ({
                        ...g,
                        conditions: g.conditions.filter((c) => c.label !== variableToDelete.label)
                    }))
                }
            }))
        );
        setIsSaved(false);
    }

    //---------- FLOW ----------//
    

    if (isLoading) return (<div></div>)

    return (
        <div className="relative">
            <header className="h-16 flex justify-between border-b px-4 bg-white">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl capitalize">{storyData.story?.title}</h1>
                    { !isSaved && <button onClick={async () => setIsSaved(await storyData.save(id as string))} className="btn-primary">Sauvegarder</button> }
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
                    nodes={storyData.nodes}
                    edges={storyData.edges}
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
                        element={current as StoryNode}
                        variables={storyData.variables}
                        onDataChange={onDataChange}
                        onFieldChange={onFieldChange}
                        onAddParagraph={onAddParagraph}
                        onAddGroup={onAddGroup}
                        onAddCondition={onAddCondition}
                        onRemoveGroup={onRemoveGroup}
                        onRemoveCondition={onRemoveCondition}
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
                        variables={storyData.variables}
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
                        <p>Créé le {new Date(storyData.story?.createdAt ?? '').toLocaleString()}</p>
                        <p>Mis à jour le {new Date(storyData.story?.updatedAt ?? '').toLocaleString()}</p>
                    </div>
                }
            </div>
        </div>
    )
}