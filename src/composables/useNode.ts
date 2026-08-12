import { VariableNodeData } from "@/types"
import { Edge, Node } from "@xyflow/react"

export default function useNode() {

    const getChoices = (edges: Edge[], node: Node) => {
        return edges.filter((edge) => edge.source === node.id)
    }

    const getVariables = (nodes: Node[]) => {
        return nodes.filter((node) => node.type === 'variable')
    }

    const getVariable = (nodes: Node[], name: string) => {
        return nodes.filter((node) => node.type === 'variable' && node.data.name === name)
    }

    // ! Change prototype (content won't be a simple string). That's a test
    const replaceVariablesInString = (nodes: Node[], content: string) => {
        if (!nodes.length) return;

        const variables = getVariables(nodes);

        variables.forEach((variable) => {
            console.log(variable)
            const data = variable.data as unknown as VariableNodeData;
            content = content.replaceAll(new RegExp(`\\[\\[${ data.label }]]`, 'g'), String(data.value));
        })

        return content
    }

    return {
        getChoices,
        getVariables,
        replaceVariablesInString,
    }
}