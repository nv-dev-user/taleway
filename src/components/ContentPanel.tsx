import { NodeData, StoryNode } from "@/types"
import { Icon } from "@iconify/react"

interface ContentPanelProps {
    node: StoryNode|undefined
    onDataChange: (field: keyof NodeData, value: string) => void
    onAddParagraph: () => void
}

export default function ContentPanel ({ node, onDataChange, onAddParagraph }: ContentPanelProps) {
    if (!node) return (
        <div className="flex h-full justify-center items-center">
            <p>Select a node to edit its content</p>
        </div>
    )

    return (
        <div className="relative h-full">
            <input
                type="text"
                value={node.data.label as string}
                onChange={(e) => onDataChange('label', e.currentTarget.value)}
                className="focus:outline-none focus:border focus:border-black hover:border hover:border-black border border-transparent rounded-lg focus:border-b text-xl w-full p-1 text-center"
                placeholder="Label"
                required
            />

            <div className="absolute bottom-0 right-0 grid gap-2 grid-cols-12 w-full">
                <button className="btn-primary flex gap-2 items-center col-span-4">
                    <Icon icon="mdi:plus-circle-outline" className="size-5" onClick={onAddParagraph} />
                    <span className="text-sm">Paragraph</span>
                </button>
                <button className="btn-primary-disabled flex gap-2 items-center col-span-4">
                    <Icon icon="mdi:plus-circle-outline" className="size-5" />
                    <span className="text-xs">Image</span>
                </button>
                <button className="btn-primary-disabled flex gap-2 items-center col-span-4">
                    <Icon icon="mdi:plus-circle-outline" className="size-5" />
                    <span className="text-xs">Sound / Music</span>
                </button>
            </div>
        </div>
    )
}