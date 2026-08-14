import { Condition, ConditionGroup, StoryEdge, StoryNode, Variable } from "@/types"
import { Edge, Node } from "@xyflow/react"

export default function useNode() {

    const evaluateCondition = (c: Condition, variables: Variable[]): boolean => {
        const variable = variables.filter((v) => v.label === c.label).at(0)
        if (!variable) return true

        switch (c.operation) {
            case '==': return variable.value == c.value
            case '!=': return variable.value != c.value
            case '<': return Number(variable.value) < Number(c.value)
            case '<=': return Number(variable.value) <= Number(c.value)
            case '>': return Number(variable.value) > Number(c.value)
            case '>=': return Number(variable.value) >= Number(c.value)
            default: return true
        }
    }

    const evaluateGroup = (group: ConditionGroup, variables: Variable[]): boolean => {
        return group.conditions.every((c) => evaluateCondition(c, variables))
    }

    const getChoices = (edges: StoryEdge[], node: StoryNode, variables: Variable[]) => {
        return edges
            .filter((edge) => edge.source === node.id)
            .filter((edge) => {
                if (!edge.data.conditionGroups || edge.data.conditionGroups.length === 0) return true
                return edge.data.conditionGroups.some((group) => evaluateGroup(group, variables))
            })
    }

    const replaceVariables = (variables: Variable[], content: string) => {
        if (!variables || variables.length === 0) return content;

        console.log(variables);

        variables.forEach((variable) => content = content.replaceAll(new RegExp(`\\[\\[${variable.label}\\]\\]`, 'g'), variable.value as string))

        return content;
    }

    return {
        getChoices,
        replaceVariables
    }
}