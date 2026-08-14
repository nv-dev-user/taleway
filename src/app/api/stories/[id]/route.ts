// ! Protéger les routes (authentication, interval)

import { db } from "@/lib/db"
import { stories } from "@/lib/schema"
import { GraphData, Story, StoryEdge, StoryNode, Variable } from "@/types";
import { Edge, Node } from "@xyflow/react";
import { eq } from "drizzle-orm"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Retrieving story
        const story = db.select().from(stories).where(eq(stories.id, Number(id))).get();

        if (!story) return Response.json({ message: "The story does not exist" }, { status: 404 });
        else return Response.json({ story });
    } catch (e) {
        return Response.json({ message: "An error occured. Please try again." }, { status: 500 });
    }
}

type SaveInfo = {
    title: string,
    nodes: StoryNode[],
    edges: StoryEdge[],
    variables: Variable[]
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;

    try {
        // Retrieving info to update
        const { title, nodes, edges, variables }: SaveInfo = await req.json();
        if (!title) return Response.json({ message: "The title cannot be empty" }, { status: 400 });

        // Verifying story existance
        const data = db.select().from(stories).where(eq(stories.id, Number(id))).get();
        if (!data) return Response.json({ message: "The story does not exist." }, { status: 404 });

        // Updating
        if (variables.filter((variable) => variable.label === '' || variable.value === '').length > 0)
            return Response.json({ message: "One or more variables are invalid" }, { status: 400 });

        const graph: GraphData = { nodes, edges, variables };
        await db.update(stories).set({
            title,
            graph,
        }).where(eq(stories.id, Number(id)));

        return Response.json({})
    } catch (e) {
        return Response.json({ message: "An error occured. Please try again." }, { status: 500 });
    }
}