"use client"

import { Condition, ConditionGroup, StoryNode, Trigger, Variable } from "@/types"
import { Icon } from "@iconify/react"
import ConditionsEditor from "./ConditionsEditor"

interface TriggersPanelProps {
    triggers: Trigger[]
    variables: Variable[]
    nodes: StoryNode[]
    onAddTrigger: () => void
    onRemoveTrigger: (index: number) => void
    onTriggerConditionsChanged: (triggerIndex: number, groupIndex: number, conditionIndex: number, field: keyof Condition, value: string) => void
    onTriggerAddGroup: (triggerIndex: number) => void
    onTriggerAddCondition: (triggerIndex: number, groupIndex: number) => void
    onTriggerRemoveGroup: (triggerIndex: number, groupIndex: number) => void
    onTriggerRemoveCondition: (triggerIndex: number, groupIndex: number, conditionIndex: number) => void
    onAddAction: (triggerIndex: number) => void
    onRemoveAction: (triggerIndex: number, actionIndex: number) => void
    onActionChanged: (triggerIndex: number, actionIndex: number, field: string, value: string) => void
}

export default function TriggersPanel({
    triggers,
    variables,
    nodes,
    onAddTrigger,
    onRemoveTrigger,
    onTriggerConditionsChanged,
    onTriggerAddGroup,
    onTriggerAddCondition,
    onTriggerRemoveGroup,
    onTriggerRemoveCondition,
    onAddAction,
    onRemoveAction,
    onActionChanged
}: TriggersPanelProps) {
    const getVariableByLabel = (label: string) => {
        return variables.filter((v) => v.label === label).at(0);
    }

    const hasValidVariables = variables.filter((v) => v.label !== '').length > 0

    return (
        <div className="relative h-full">
            <h2 className="text-center text-xl font-bold mb-8">Triggers</h2>

            <div className="flex flex-col gap-6">
                {triggers.map((trigger, triggerIndex) => (
                    <div key={trigger.id} className="flex flex-col gap-4 p-4 border-2 rounded-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-500">Trigger {triggerIndex + 1}</span>
                            <button className="cursor-pointer flex items-center h-8 w-8 justify-center hover:bg-gray-100" onClick={() => onRemoveTrigger(triggerIndex)}>
                                <Icon icon="mdi:trash-can" className="text-red-500" />
                            </button>
                        </div>

                        {/* Conditions */}
                        <div>
                            <p className="text-sm font-bold mb-2">Conditions (when...)</p>
                            <ConditionsEditor
                                conditionGroups={trigger.conditionGroups}
                                variables={variables}
                                onConditionsChanged={(gi, ci, f, v) => onTriggerConditionsChanged(triggerIndex, gi, ci, f, v)}
                                onAddGroup={() => onTriggerAddGroup(triggerIndex)}
                                onAddCondition={(gi) => onTriggerAddCondition(triggerIndex, gi)}
                                onRemoveGroup={(gi) => onTriggerRemoveGroup(triggerIndex, gi)}
                                onRemoveCondition={(gi, ci) => onTriggerRemoveCondition(triggerIndex, gi, ci)}
                            />
                        </div>

                        {/* Actions */}
                        <div>
                            <p className="text-sm font-bold mb-2">Actions (then...)</p>
                            <div className="flex flex-col gap-2">
                                {trigger.actions.map((action, actionIndex) => (
                                    <div key={actionIndex} className="flex gap-2 items-center">
                                        <button className="cursor-pointer flex items-center h-8 w-8 justify-center hover:bg-gray-100" onClick={() => onRemoveAction(triggerIndex, actionIndex)}>
                                            <Icon icon="mdi:trash-can" className="text-red-500" />
                                        </button>

                                        {/* Action type selector */}
                                        <select
                                            className="input-primary"
                                            value={action.type}
                                            onChange={(e) => onActionChanged(triggerIndex, actionIndex, 'type', e.currentTarget.value)}
                                        >
                                            <option value="redirect">Redirect to</option>
                                            <option value="assignment">Set variable</option>
                                        </select>

                                        {/* Redirect: node selector */}
                                        {action.type === 'redirect' && (
                                            <select
                                                className="input-primary"
                                                value={action.target}
                                                onChange={(e) => onActionChanged(triggerIndex, actionIndex, 'target', e.currentTarget.value)}
                                            >
                                                <option value="">Select a page</option>
                                                {nodes.map((n) => (
                                                    <option key={n.id} value={n.id}>{n.data.label}</option>
                                                ))}
                                            </select>
                                        )}

                                        {/* Assignment: variable + operation + value */}
                                        {action.type === 'assignment' && (
                                            <>
                                                <select
                                                    className="input-primary"
                                                    value={action.label}
                                                    onChange={(e) => onActionChanged(triggerIndex, actionIndex, 'label', e.currentTarget.value)}
                                                >
                                                    {variables.map((v, vi) => (
                                                        <option key={vi} value={v.label}>{v.label}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    className="input-primary"
                                                    value={action.operation}
                                                    onChange={(e) => onActionChanged(triggerIndex, actionIndex, 'operation', e.currentTarget.value)}
                                                >
                                                    <option value="=">set to</option>
                                                    {getVariableByLabel(action.label)?.type === 'number' && (
                                                        <>
                                                            <option value="+=">add</option>
                                                            <option value="-=">subtract</option>
                                                        </>
                                                    )}
                                                </select>

                                                {getVariableByLabel(action.label)?.type === 'boolean' && (
                                                    <select
                                                        className="input-primary"
                                                        value={action.value}
                                                        onChange={(e) => onActionChanged(triggerIndex, actionIndex, 'value', e.currentTarget.value)}
                                                    >
                                                        <option value="true">true</option>
                                                        <option value="false">false</option>
                                                    </select>
                                                )}
                                                {getVariableByLabel(action.label)?.type !== 'boolean' && getVariableByLabel(action.label)?.type !== undefined && (
                                                    <input
                                                        className="input-primary"
                                                        type={getVariableByLabel(action.label)?.type}
                                                        value={action.value}
                                                        onChange={(e) => onActionChanged(triggerIndex, actionIndex, 'value', e.currentTarget.value)}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}

                                <button className={`${hasValidVariables ? 'btn-primary' : 'btn-primary-disabled'} flex gap-2 items-center justify-center`} onClick={() => onAddAction(triggerIndex)}>
                                    <Icon icon="mdi:plus-circle-outline" className="size-5" />
                                    <span className="text-sm">Action</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add trigger button */}
            <div className="absolute bottom-0 right-0 grid grid-cols-12 w-full">
                <div className="col-span-4"></div>
                <div className="col-span-4"></div>
                <button className={`${hasValidVariables ? 'btn-primary' : 'btn-primary-disabled'} flex gap-2 items-center col-span-4 justify-center`} onClick={onAddTrigger}>
                    <Icon icon="mdi:plus-circle-outline" className="size-5" />
                    <span className="text-sm">Trigger</span>
                </button>
            </div>
        </div>
    )
}