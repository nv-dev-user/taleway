"use client"

import { Condition, ConditionGroup, Variable } from "@/types"
import { Icon } from "@iconify/react"

interface ConditionsEditorProps {
    conditionGroups: ConditionGroup[]
    variables: Variable[]
    onConditionsChanged: (groupIndex: number, conditionIndex: number, field: keyof Condition, value: string) => void
    onAddGroup: () => void
    onAddCondition: (groupIndex: number) => void
    onRemoveGroup: (groupIndex: number) => void
    onRemoveCondition: (groupIndex: number, conditionIndex: number) => void
}

export default function ConditionsEditor({
    conditionGroups,
    variables,
    onConditionsChanged,
    onAddGroup,
    onAddCondition,
    onRemoveGroup,
    onRemoveCondition
}: ConditionsEditorProps) {
    const getVariableByLabel = (label: string) => {
        return variables.filter((v) => v.label === label).at(0);
    }

    const hasValidVariables = variables.filter((v) => v.label !== '').length > 0

    return (
        <div className="flex flex-col gap-4">
            {conditionGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                    {groupIndex > 0 && (
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

                        {group.conditions.map((c, conditionIndex) => (
                            <div key={conditionIndex} className="relative flex gap-2 items-center">
                                <button className="cursor-pointer flex items-center h-8 w-8 justify-center hover:bg-gray-100" onClick={() => onRemoveCondition(groupIndex, conditionIndex)}>
                                    <Icon icon="mdi:trash-can" className="text-red-500" />
                                </button>
                                <select
                                    className="input-primary"
                                    value={c.label}
                                    onChange={(e) => onConditionsChanged(groupIndex, conditionIndex, 'label', e.currentTarget.value)}
                                >
                                    {variables.map((v, vi) => (
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
                                    {getVariableByLabel(c.label)?.type === 'number' && (
                                        <>
                                            <option value='>'>higher than</option>
                                            <option value='>='>higher or equal than</option>
                                            <option value='<'>lower than</option>
                                            <option value='<='>lower or equal than</option>
                                        </>
                                    )}
                                </select>

                                {getVariableByLabel(c.label)?.type === 'boolean' && (
                                    <select
                                        className="input-primary"
                                        value={c.value}
                                        onChange={(e) => onConditionsChanged(groupIndex, conditionIndex, 'value', e.currentTarget.value)}
                                    >
                                        <option value='true'>true</option>
                                        <option value='false'>false</option>
                                    </select>
                                )}
                                {getVariableByLabel(c.label)?.type !== 'boolean' && getVariableByLabel(c.label)?.type !== undefined && (
                                    <input
                                        className="input-primary"
                                        type={getVariableByLabel(c.label)?.type}
                                        value={c.value}
                                        onChange={(e) => onConditionsChanged(groupIndex, conditionIndex, 'value', e.currentTarget.value)}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="absolute bottom-0 right-0 m-2">
                            <button className={`${hasValidVariables ? 'btn-primary' : 'btn-primary-disabled'} flex gap-2 items-center justify-center`} onClick={() => onAddCondition(groupIndex)}>
                                <Icon icon="mdi:plus-circle-outline" className="size-5" />
                                <span className="text-sm">Condition</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button className={`${hasValidVariables ? 'btn-primary' : 'btn-primary-disabled'} flex gap-2 items-center justify-center`} onClick={onAddGroup}>
                <Icon icon="mdi:plus-circle-outline" className="size-5" />
                <span className="text-sm">Group</span>
            </button>
        </div>
    )
}