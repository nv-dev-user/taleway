import { Variable } from "@/types"
import { Edge, Node } from "@xyflow/react"

export default function useNode() {

    const getChoices = (edges: Edge[], node: Node) => {
        return edges.filter((edge) => edge.source === node.id)
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