"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function EditorDashboardPage() {
    const [name, setName] = useState("")
    const router = useRouter()

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
        </div>
    )
}