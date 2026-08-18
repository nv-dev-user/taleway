"use client"

import { Story } from "@/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

export default function EditorDashboardPage() {
    const [name, setName] = useState("")
    const [stories, setStories] = useState<Story[]>([])
    const router = useRouter()

    useEffect(() => {
        startTransition(async () => {
            const res = await fetch('/api/stories', {
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await res.json();

            if (res.status === 200) setStories(data.stories)
        })
    }, [])

    const createStory = async () => {
        const body = JSON.stringify({ title: name })

        const res = await fetch('/api/stories', {
            method: 'POST',
            body: body,
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await res.json()

        if (res.status === 201) router.push(`/editor/${data.id}`)
        else console.error(res.status, data.message)
    }

    return (
        <div>
            <input
                type="text"
                className="bg-white caret-black text-black border"
                onChange={(e) => setName(e.currentTarget.value)}
            />
            <button onClick={createStory}>Create New Story</button>

            <div>
                {
                    stories.map((story) =>
                        <div key={story.id}>
                            <Link href={`/editor/${story.id}`}>
                                { story.title }
                            </Link>
                        </div>
                    )

                }
            </div>
        </div>
    )
}