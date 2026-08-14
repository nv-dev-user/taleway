"use client"

import { useMemo, useState } from "react";
import useStoryData from "./useStoryData";
import { isNode } from "@xyflow/react";
import { ConditionGroup, ContentItem, NodeData, StoryEdge, StoryNode, Variable } from "@/types";

export default function usePanelContent(
    storyData: ReturnType<typeof useStoryData>,
    setIsSaved: (value: boolean) => void
) {
    const [currentId, setCurrentId] = useState<string|undefined>(undefined)
    const current = useMemo(
        () => storyData.nodes.find((n) => n.id === currentId) ?? storyData.edges.find((e) => e.id === currentId),
        [storyData.nodes, storyData.edges, currentId]
    )

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
        if (storyData.variables.filter((v) => v.label !== '').length <= 0) return;

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

    return {
        currentId,
        setCurrentId,
        current,
        // ---
        onFieldChange,
        onAddGroup,
        onAddCondition,
        onRemoveGroup,
        onRemoveCondition,
        onDataChange,
        onAddParagraph,
        onVariableChange,
        onAddVariable,
        onRemoveVariable
    }
}