import { StoryNodeProps } from "@/types";
import { Handle, Position } from "@xyflow/react";

export default function PageNode({ data, selected }: StoryNodeProps) {
    return (
        <div className={`h-fit p-2 border border-black rounded flex items-center justify-center ${selected ? 'bg-gray-100': 'bg-white text-black'}`}>
            <div>
                <p className="text-xs">{data.label}</p>
            </div>
            <Handle type="target" position={Position.Top} className="border-white! bg-accent! -z-1 rounded-b-none! w-3! h-3!" />
            <Handle type="source" position={Position.Bottom} className="border-white! bg-accent! -z-1 rounded-t-none! w-3! h-3!" />
        </div>
    )
}