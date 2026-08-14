import { Condition, ConditionGroup, ContentItem, EdgeData, NodeData, StoryEdge, StoryNode, Variable } from "@/types"
import { Icon } from "@iconify/react"
import { isEdge, isNode } from "@xyflow/react"

interface ContentPanelProps {
    element: StoryNode|StoryEdge|undefined
    variables: Variable[]
    onDataChange: (field: keyof NodeData|keyof EdgeData, value: string|ContentItem[]|ConditionGroup[]) => void
    onFieldChange: (field: keyof StoryNode|keyof StoryEdge, value: string) => void
    onAddParagraph: () => void

    onAddGroup: () => void
    onAddCondition: (groupIndex: number) => void
    onRemoveGroup: (groupIndex: number) => void
    onRemoveCondition: (groupIndex: number, conditionIndex: number) => void
}

export default function ContentPanel ({ element, variables, onDataChange, onAddParagraph, onFieldChange, onAddGroup, onAddCondition, onRemoveGroup, onRemoveCondition }: ContentPanelProps) {

    if (!element) return (
        <div className="flex h-full justify-center items-center">
            <p>Select a node or an edge to edit its content</p>
        </div>
    )

    const getVariableByLabel = (label: string) => {
        return variables.filter((v) => label === v.label).at(0);
    }

    const onConditionsChanged = (groupIndex: number, conditionIndex: number, field: keyof Condition, value: string) => {
        if (!isEdge(element)) return;
        const newGroups = element.data.conditionGroups.map((g, gi) =>
            gi === groupIndex
                ? { ...g, conditions: g.conditions.map((c, ci) =>
                    ci === conditionIndex ? { ...c, [field]: value } : c
                  )}
                : g
        );
        onDataChange('conditionGroups', newGroups)
    }

    const onContentChanged = (index: number, newContent: string) => {
        if (!isNode(element)) return;
        const els = element.data.content.map((c, i) => i === index ? { ...c, content: newContent } : c);
        onDataChange('content', els)
    }

    const onContentRemoved = (index: number) => {
        if (!isNode(element)) return;
        const newContentArray = element.data.content.filter((_, i) => i !== index)
        onDataChange('content', newContentArray)
    }

    return (
        <div className="relative h-full">
            <input
                type="text"
                value={isNode(element) ? (element.data.label as string ?? '') : (element.label as string ?? '')}
                onChange={(e) => isNode(element) ? onDataChange('label', e.currentTarget.value) : onFieldChange('label', e.currentTarget.value)}
                className="mb-10 focus:outline-none focus:border focus:border-black hover:border hover:border-black border border-transparent rounded-lg focus:border-b text-xl w-full p-1 text-center"
                placeholder="Label"
                required
            />

            <div className="flex flex-col gap-4">
                { isNode(element) && element.data.content.map((c, index) => {
                    if (c.type === 'paragraph') return (
                        <div key={index} className="flex gap-2 items-center">
                            <button className="cursor-pointer flex items-center h-10 w-10 justify-center hover:bg-gray-100 py-1" onClick={() => onContentRemoved(index)}>
                                <Icon icon="mdi:trash-can" className="text-red-500" />
                            </button>
                            <textarea
                                ref={(el) => {
                                    if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                    }
                                }}
                                className="w-full min-h-10 resize-none textarea-primary h-fit overflow-hidden"
                                value={element.data.content[index].content}
                                onChange={(e) => onContentChanged(index, e.currentTarget.value)}
                            />
                        </div>
                    )

                    // TODO: Image + Sound/Music
                })}

                { isEdge(element) && element.data.conditionGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        { groupIndex > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-1 h-px bg-gray-300"></div>
                                <span className="font-bold text-gray-500">OR</span>
                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2 p-2 border rounded-lg relative min-h-24">
                            <div className="flex items-center justify-end">
                                <button className="cursor-pointer flex items-center h-8 w-8 justify-center hover:bg-gray-100" onClick={() => onRemoveGroup(groupIndex)}>
                                    <Icon icon="mdi:trash-can" className="text-red-500" />
                                </button>
                            </div>

                        { group.conditions.map((c, conditionIndex) => (
                            <div key={conditionIndex} className="relative flex gap-2 items-center">
                                <button className="cursor-pointer flex items-center h-8 w-8 justify-center hover:bg-gray-100" onClick={() => onRemoveCondition(groupIndex, conditionIndex)}>
                                    <Icon icon="mdi:trash-can" className="text-red-500" />
                                </button>
                                <select
                                    className="input-primary"
                                    value={c.label}
                                    onChange={(e) => onConditionsChanged(groupIndex, conditionIndex, 'label', e.currentTarget.value)}
                                >
                                    { variables.map((v, vi) => (
                                        <option key={vi} value={v.label}>{v.label}</option>
                                    ))}
                                </select>

                                <select
                                    className="input-primary"
                                    value={c.operation}
                                    onChange={(e) => onConditionsChanged(groupIndex, conditionIndex, 'operation', e.currentTarget.value)}
                                >
                                    <option value='=='>equal to</option>
                                    <option value='!='>different to</option>
                                    { getVariableByLabel(c.label)?.type === 'number' &&
                                        <>
                                            <option value='>'>higher than</option>
                                            <option value='>='>higher or equal than</option>
                                            <option value='<'>lower than</option>
                                            <option value='<='>lower or equal than</option>
                                        </>
                                    }
                                </select>

                                { getVariableByLabel(c.label)?.type === 'boolean' &&
                                    <select
                                        className="input-primary"
                                        value={c.value}
                                        onChange={(e) => onConditionsChanged(groupIndex, conditionIndex, 'value', e.currentTarget.value)}
                                    >
                                        <option value='true'>true</option>
                                        <option value='false'>false</option>
                                    </select>
                                }
                                { getVariableByLabel(c.label)?.type !== 'boolean' && getVariableByLabel(c.label)?.type !== undefined &&
                                    <input
                                        className="input-primary"
                                        type={getVariableByLabel(c.label)?.type}
                                        value={c.value}
                                        onChange={(e) => onConditionsChanged(groupIndex, conditionIndex, 'value', e.currentTarget.value)}
                                    />
                                }
                            </div>
                        ))}

                            <div className="absolute bottom-0 right-0 m-2">
                                <button className={`${variables.filter((v) => v.label !== '').length > 0 ? 'btn-primary' : 'btn-primary-disabled'} flex gap-2 items-center justify-center`} onClick={() => onAddCondition(groupIndex)}>
                                    <Icon icon="mdi:plus-circle-outline" className="size-5" />
                                    <span className="text-sm">Condition</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            { isNode(element) &&
                <div className="absolute bottom-0 right-0 grid gap-2 grid-cols-12 w-full">
                    <button className="btn-primary flex gap-2 items-center col-span-4 justify-center" onClick={onAddParagraph}>
                        <Icon icon="mdi:plus-circle-outline" className="size-5" />
                        <span className="text-sm">Paragraph</span>
                    </button>
                    <button className="btn-primary-disabled flex gap-2 items-center col-span-4 justify-center">
                        <Icon icon="mdi:plus-circle-outline" className="size-5" />
                        <span className="text-xs">Image</span>
                    </button>
                    <button className="btn-primary-disabled flex gap-2 items-center col-span-4 justify-center">
                        <Icon icon="mdi:plus-circle-outline" className="size-5" />
                        <span className="text-xs">Sound / Music</span>
                    </button>
                </div>
            }
            { isEdge(element) &&
                <div className="absolute bottom-0 right-0 grid grid-cols-12 w-full">
                    <div className="col-span-4"></div>
                    <div className="col-span-4"></div>
                    <button className={`${variables.filter((v) => v.label !== '').length > 0 ? 'btn-primary' : 'btn-primary-disabled'} flex gap-2 items-center col-span-4 justify-center`} onClick={onAddGroup}>
                        <Icon icon="mdi:plus-circle-outline" className="size-5" />
                        <span className="text-sm">Group</span>
                    </button>
                </div>
            }
        </div>
    )
}