"use client"

import { useSortable } from "@dnd-kit/react/sortable"
import { Icon } from "@iconify/react"
import { ReactNode } from "react"

interface SortableContentItemProps {
    id: string
    index: number
    children: ReactNode
    onRemove: () => void
}

export default function SortableContentItem({ id, index, children, onRemove }: SortableContentItemProps) {
    const { ref, handleRef, isDragging } = useSortable({ id, index })

    return (
        <div
            ref={ref}
            className={`grid grid-cols-12 gap-2 items-center ${isDragging ? 'opacity-30' : ''}`}
        >
            <button
                ref={handleRef}
                className="col-span-1 cursor-grab active:cursor-grabbing flex items-center justify-center h-10 w-10 py-1"
            >
                <Icon icon="mdi:drag-vertical" className="text-gray-500" />
            </button>
            <button
                className="col-span-1 cursor-pointer flex items-center h-10 w-10 justify-center hover:bg-gray-100 py-1"
                onClick={onRemove}
            >
                <Icon icon="mdi:trash-can" className="text-red-500" />
            </button>
            <div className="col-span-10">
                {children}
            </div>
        </div>
    )
}