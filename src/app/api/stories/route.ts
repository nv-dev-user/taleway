import { db } from "@/lib/db"
import { stories } from "@/lib/schema"

export async function POST(req: Request) {
    const data = await req.json()

    const { title } = data
    if (!title) return Response.json({ message: "Please give a title." }, { status: 400})

    try {
        const row = await db.insert(stories).values({ title })
        return Response.json({ id: row.lastInsertRowid }, { status: 201 })
    } catch {
        return Response.json({ message: "An error occured. Please try again."}, { status: 500 })
    }
}