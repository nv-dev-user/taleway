import { Assignment, Condition, ConditionGroup, StoryEdge, StoryNode, Trigger, TriggerAction, Variable } from "@/types"

const evaluateCondition = (c: Condition, variables: Variable[]): boolean => {
    const variable = variables.filter((v) => v.label === c.label).at(0)
    if (!variable) return true

    // Convertir la valeur de la condition selon le type de la variable
    const parseValue = (val: string): string | number | boolean => {
        switch (variable.type) {
            case 'boolean': return val === 'true'
            case 'number': return Number(val)
            default: return val
        }
    }

    const parsedValue = parseValue(c.value)

    switch (c.operation) {
        case '==': return variable.value === parsedValue
        case '!=': return variable.value !== parsedValue
        case '<': return Number(variable.value) < Number(parsedValue)
        case '<=': return Number(variable.value) <= Number(parsedValue)
        case '>': return Number(variable.value) > Number(parsedValue)
        case '>=': return Number(variable.value) >= Number(parsedValue)
        default: return true
    }
}

const evaluateGroup = (group: ConditionGroup, variables: Variable[]): boolean => {
    return group.conditions.every((c) => evaluateCondition(c, variables))
}

export const getChoices = (edges: StoryEdge[], node: StoryNode, variables: Variable[]) => {
    return edges
        .filter((edge) => edge.source === node.id)
        .filter((edge) => {
            if (!edge.data.conditionGroups || edge.data.conditionGroups.length === 0) return true
            return edge.data.conditionGroups.some((group) => evaluateGroup(group, variables))
        })
}

export const setVariable = (variables: Variable[], assignment: Assignment): Variable[] => {
    if (!variables || variables.length === 0) return []

    const variable = variables.find((v) => v.label === assignment.label)
    if (!variable) return variables

    // Convertir la valeur selon le type de la variable
    const parseValue = (val: string): string | number | boolean => {
        switch (variable.type) {
            case 'boolean': return val === 'true'
            case 'number': return Number(val)
            default: return val
        }
    }

    switch (assignment.operation) {
        case '=':
            return variables.map((v) => v.label === assignment.label ? { ...v, value: parseValue(assignment.value) } : v)
        case '+=':
            return variables.map((v) => v.label === assignment.label ? { ...v, value: Number(v.value) + Number(assignment.value) } : v)
        case '-=':
            return variables.map((v) => v.label === assignment.label ? { ...v, value: Number(v.value) - Number(assignment.value) } : v)
        default:
            return variables
    }
}

export const replaceVariables = (variables: Variable[], content: string) => {
    if (!variables || variables.length === 0) return content;

    variables.forEach((variable) => content = content.replaceAll(new RegExp(`\\[\\[${variable.label}\\]\\]`, 'g'), variable.value as string))

    return content;
}

// Évalue les triggers après chaque action du joueur
// Retourne les variables mises à jour et l'id du node de redirection (ou null)
export const evaluateTriggers = (
    triggers: Trigger[],
    variables: Variable[],
    maxIterations = 5
): { variables: Variable[]; redirectNodeId: string | null } => {
    if (!triggers || triggers.length === 0) return { variables, redirectNodeId: null }

    let currentVars = variables
    let redirectNodeId: string | null = null

    for (let i = 0; i < maxIterations; i++) {
        // Trouver le premier trigger qui matche
        const matchedTrigger = triggers.find(t =>
            t.conditionGroups.length > 0 &&
            t.conditionGroups.some(group => evaluateGroup(group, currentVars))
        )

        if (!matchedTrigger) break

        // Appliquer les actions du trigger
        let newRedirect: string | null = null
        for (const action of matchedTrigger.actions) {
            if (action.type === 'redirect') {
                newRedirect = action.target
            } else if (action.type === 'assignment') {
                currentVars = setVariable(currentVars, {
                    label: action.label,
                    operation: action.operation,
                    value: action.value
                })
            }
        }

        // Si le trigger redirige, on garde la redirection et on arrête
        if (newRedirect) {
            redirectNodeId = newRedirect
            break
        }

        // Si pas de redirection mais des assignments, on réévalue les triggers
        // (un autre trigger pourrait maintenant matcher)
        // Si aucun assignment n'a été fait non plus, on arrête pour éviter une boucle
        const hasAssignment = matchedTrigger.actions.some(a => a.type === 'assignment')
        if (!hasAssignment) break
    }

    return { variables: currentVars, redirectNodeId }
}