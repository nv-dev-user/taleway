import { Variable } from "@/types"
import { Edge, Node } from "@xyflow/react"

export default function useNode() {

    const getChoices = (edges: Edge[], node: Node) => {
        return edges.filter((edge) => edge.source === node.id)
    }

    return {
        getChoices
    }
}