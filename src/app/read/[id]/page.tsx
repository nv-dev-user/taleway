"use client"

import useNode from "@/composables/useNode";
import { Story } from "@/types";
import { Icon } from "@iconify/react";
import { Node } from "@xyflow/react";
import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

export default function ReadPage() {
    const { id } = useParams();

    const noder = useNode();
    const router = useRouter();

    const [story, setStory] = useState<Story>();
    const [currentPage, setCurrentPage] = useState<Node>();

    useEffect(() => {
        startTransition(async () => {
            const res = await fetch(`/api/stories/${id}`);
            const data = await res.json();

            if (res.status !== 200) {
                router.push('/read');
            } else {
                const story = data.story as Story;
                setStory(story);
                setCurrentPage(story.graph.nodes[0] ?? '')
            }
        });
    }, [id]);

    const next = (id: string) => {
        const nextNode = story?.graph.nodes.filter(node => node.id === id).at(0);
        if (!nextNode) return;
        setCurrentPage(nextNode);
    }

    return (
        <div className="flex-1 flex flex-col pb-4">
            <header className="h-16 border-b flex items-center px-6">
                <button className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                    <Icon icon="mdi:chevron-left-circle" className="size-8" />
                    <span className="font-bold">Quitter</span>
                </button>
            </header>
            <main className="flex flex-col flex-1 gap-4 text-justify pt-4" id="parchment">
                <div className="flex-1 flex flex-col gap-4">
                    { noder.replaceVariablesInString(story?.graph.nodes ?? [], currentPage?.data.content as string) }
                </div>

                {
                    currentPage &&
                    story?.graph.edges &&
                    noder.getChoices(story?.graph.edges ?? [], currentPage).map(choice => (
                        <button className="btn-primary" key={choice.id} onClick={() => next(choice.target)}>{choice.label}</button>
                    ))
                }
            </main>
        </div>
    )
}