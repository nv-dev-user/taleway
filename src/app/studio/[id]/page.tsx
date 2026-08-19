"use client"

import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { useParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import '@xyflow/react/dist/style.css';
import { StoryNode } from "@/types";
import VariablePanel from "@/components/VariablePanel";
import { Icon } from "@iconify/react";
import StartNode from "@/components/nodes/StartNode";
import EndNode from "@/components/nodes/EndNode";
import PageNode from "@/components/nodes/PageNode";
import ContentPanel from "@/components/ContentPanel";
import TriggersPanel from "@/components/TriggersPanel";
import useStoryData from "@/composables/useStoryData";
import useEditorCallbacks from "@/composables/useEditorCallbacks";
import useEditorFlow from "@/composables/useEditorFlow";
import usePanelContent from "@/composables/usePanelContent";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    const router = useRouter()

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSaved, setIsSaved] = useState<boolean>(true);

    const [panel, setPanel] = useState<
        'state'
        | 'content'
        | 'hidden'
        | 'global-settings'
        | 'settings'
        | 'soundboard'
        | 'triggers'
    >('content');

    const storyData = useStoryData()
    const panelContent = usePanelContent(storyData, setIsSaved)
    const {
        pendingNode,
        setPendingNode,
        ghostPosition,
        setGhostPosition,
        flowWrapperRef,
        onAddPageNode,
        onAddEndNode,
        onPaneMouseMove,
        onPaneClick
    } = useEditorFlow(storyData);
    const {
        onBeforeDelete,
        onSelectionChange,
        onNodesChange,
        onEdgesChange,
        onConnect
    } = useEditorCallbacks(storyData, panelContent, setIsSaved);

    //---------- FUNCTIONS ----------//

    // ESC to cancel pending node / Ctrl+S to save
    useEffect(() => {
        const onKey = async (e: KeyboardEvent) => {
            if (e.key === 'Escape' && pendingNode) {
                setPendingNode(null)
                setGhostPosition(null)
            }

            if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                setIsSaved(await storyData.save(id as string))
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [id, pendingNode, storyData, setGhostPosition, setPendingNode])

    useEffect(() => {
        startTransition(async () => {
            await storyData.load(id as string);
            setIsLoading(false);
        })
    }, [])

    if (isLoading) return (<div></div>)

    return (
        <div className="relative">
            <header className="h-16 flex justify-between border-b px-4 bg-white">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/studio')}>
                        <Icon icon="mdi:chevron-left-circle" className="size-8" />
                        <span className="font-bold">Quitter</span>
                    </button>
                    <h1 className="text-3xl capitalize">{storyData.story?.title}</h1>
                    { !isSaved && <button onClick={async () => setIsSaved(await storyData.save(id as string))} className="btn-primary">Sauvegarder</button> }
                    { isSaved && <button className="font-bold text-gray-300 p-2">Sauvegardé</button>}
                </div>
                <div className="flex items-center">
                    <Link href={`/studio/${id}/debug`}>
                        <Icon icon="mdi:bug-play" className="size-10 text-green-700"/>
                    </Link>
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

                {/* Open story global soundboard */}
                <button
                    onClick={() => setPanel('soundboard')}
                    className={`border-l border-t cursor-pointer absolute items-center justify-center flex  bottom-24 -left-8 ${panel === 'soundboard' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:speakerphone" className="size-6 text-black"/>
                </button>
                {/* Open triggers panel */}
                <button
                    onClick={() => setPanel('triggers')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex bottom-16 -left-8 ${panel === 'triggers' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
                >
                    <Icon icon="mdi:flash-outline" className="size-6"/>
                </button>
                {/* Open story state panel : variables */}
                <button
                    onClick={() => setPanel('state')}
                    className={`border-l cursor-pointer absolute items-center justify-center flex  bottom-8 -left-8 ${panel === 'state' ? 'bg-white' : 'bg-gray-200'} w-8 h-8`}
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
                        element={panelContent.current as StoryNode}
                        variables={storyData.variables}
                        onDataChange={panelContent.onDataChange}
                        onFieldChange={panelContent.onFieldChange}
                        onAddParagraph={panelContent.onAddParagraph}
                        onAddImage={panelContent.onAddImage}
                        onAddGroup={panelContent.onAddGroup}
                        onAddCondition={panelContent.onAddCondition}
                        onRemoveGroup={panelContent.onRemoveGroup}
                        onRemoveCondition={panelContent.onRemoveCondition}
                        onAddAssignment={panelContent.onAddAssignment}
                        onRemoveAssignment={panelContent.onRemoveAssignment}
                        onAssignmentChanged={panelContent.onAssignmentChanged}
                    />
                }
                { panel === 'settings' &&
                    <div>
                        <p>- Modifier couleur de fond</p>
                        <p>- Modifier couleur label</p>
                    </div>
                }
                {
                    panel === 'soundboard' && (<div></div>)
                }
                { panel === 'triggers' &&
                    <TriggersPanel
                        triggers={storyData.triggers}
                        variables={storyData.variables}
                        nodes={storyData.nodes}
                        onAddTrigger={panelContent.onAddTrigger}
                        onRemoveTrigger={panelContent.onRemoveTrigger}
                        onTriggerConditionsChanged={panelContent.onTriggerConditionsChanged}
                        onTriggerAddGroup={panelContent.onTriggerAddGroup}
                        onTriggerAddCondition={panelContent.onTriggerAddCondition}
                        onTriggerRemoveGroup={panelContent.onTriggerRemoveGroup}
                        onTriggerRemoveCondition={panelContent.onTriggerRemoveCondition}
                        onAddAction={panelContent.onAddAction}
                        onRemoveAction={panelContent.onRemoveAction}
                        onActionChanged={panelContent.onActionChanged}
                    />
                }
                { panel === 'state' &&
                    <VariablePanel
                        variables={storyData.variables}
                        onAddVariable={panelContent.onAddVariable}
                        onRemoveVariable={panelContent.onRemoveVariable}
                        onVariableChange={panelContent.onVariableChange}
                    />
                }
                { panel === 'global-settings' &&
                    <div>
                        <p className="text-center font-bold text-xl mb-8">Story Settings</p>
                        <p>- Modifier titre</p>
                        <p>- Modifier couverture</p>
                        <p>- Modifier description</p>
                        <p>- Modifier tags & catégorie</p>
                        <br />
                        <p>Créé le {new Date(storyData.story?.createdAt ?? '').toLocaleString()}</p>
                        <p>Mis à jour le {new Date(storyData.story?.updatedAt ?? '').toLocaleString()}</p>
                    </div>
                }
            </div>
        </div>
    )
}