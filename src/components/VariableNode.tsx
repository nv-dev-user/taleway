"use client"

import { VariableNodeData } from "@/types";
import { useReactFlow } from "@xyflow/react";

export default function VariableNode({ id, data }: { id: string, data: VariableNodeData }) {
    const { updateNodeData } = useReactFlow();

    const onChange = (field: keyof VariableNodeData, value: string | boolean | number) => {
        updateNodeData(id, { [field]: value })
    }

    return (
        <div className="bg-white rounded-lg border text-xs p-1">
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    className="border rounded w-30 nodrag"
                    value={data.label}
                    onChange={(e) => onChange('label', e.currentTarget.value)}
                />
            </div>
            <div className="flex">
                <label>Type:</label>
                <select
                    className="border rounded w-30 nodrag"
                    value={data.type}
                    onChange={ (e) => onChange('type', e.currentTarget.value) }
                >
                    <option value="text">Text</option>
                    <option value="boolean">Boolean</option>
                    <option value="number">Number</option>
                </select>
            </div>
            <div>
                <label>Initial:</label>
                { ['text', 'number'].includes(data.type) &&
                    <input
                        value={data.value as string | number}
                        onChange={(e) => onChange('value', e.currentTarget.value)}
                        type={data.type}
                        className="border rounded w-30 nodrag"
                    />
                }
                { data.type === 'boolean' &&
                    <select
                        className="border rounded w-30 nodrag"
                        value={String(data.value)}
                        onChange={(e) => onChange('value', e.currentTarget.value)}
                    >
                            <option value="true">True</option>
                            <option value="false">False</option>
                    </select>
                }
            </div>
        </div>
    )
}