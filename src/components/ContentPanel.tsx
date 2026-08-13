import { ContentItem, NodeData, StoryNode } from "@/types"
import { Icon } from "@iconify/react"

interface ContentPanelProps {
    node: StoryNode|undefined
    onDataChange: (field: keyof NodeData, value: string|ContentItem[]) => void
    onAddParagraph: () => void
}

export default function ContentPanel ({ node, onDataChange, onAddParagraph }: ContentPanelProps) {
    if (!node) return (
        <div className="flex h-full justify-center items-center">
            <p>Select a node or an edge to edit its content</p>
        </div>
    )

    const onContentChanged = (index: number, newContent: string) => {
        node.data.content[index].content = newContent;
        onDataChange('content', node.data.content)
    }

    const onContentRemoved = (index: number) => {
        const newContentArray = node.data.content.filter((_, i) => i !== index)
        onDataChange('content', newContentArray)
    }

    return (
        <div className="relative h-full">
            <input
                type="text"
                value={node.data.label as string}
                onChange={(e) => onDataChange('label', e.currentTarget.value)}
                className="mb-10 focus:outline-none focus:border focus:border-black hover:border hover:border-black border border-transparent rounded-lg focus:border-b text-xl w-full p-1 text-center"
                placeholder="Label"
                required
            />

            <div className="flex flex-col gap-4">
                { node.data.content.map((c, index) => {
                    if (c.type === 'paragraph') return (
                        <div key={index} className="flex gap-2 items-center">
                            <button className="cursor-pointer flex items-center h-10 w-10 justify-center hover:bg-gray-100 py-1" onClick={() => onContentRemoved(index)}>
                                <Icon icon="mdi:trash-can" className="text-red-500" />
                            </button>
                            <textarea
                                ref={(el) => {
                                    if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                    }
                                }}
                                className="w-full min-h-10 resize-none textarea-primary h-fit overflow-hidden"
                                value={node.data.content[index].content}
                                onChange={(e) => onContentChanged(index, e.currentTarget.value)}
                            />
                        </div>
                    )

                    // TODO: Image + Sound/Music
                })}
            </div>

            <div className="absolute bottom-0 right-0 grid gap-2 grid-cols-12 w-full">
                <button className="btn-primary flex gap-2 items-center col-span-4" onClick={onAddParagraph}>
                    <Icon icon="mdi:plus-circle-outline" className="size-5" />
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