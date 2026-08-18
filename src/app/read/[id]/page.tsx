"use client"

import { getChoices, replaceVariables } from "@/composables/useReader";
import { loadBookmark, saveBookmark } from "@/composables/useSave";
import { Story, StoryNode, Variable } from "@/types";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

export default function ReadPage() {
    const { id } = useParams();

    const router = useRouter();

    const [story, setStory] = useState<Story>();
    const [variables, setVariables] = useState<Variable[]>([])
    const [currentPage, setCurrentPage] = useState<StoryNode>();

    useEffect(() => {
        startTransition(async () => {
            const res = await fetch(`/api/stories/${id}`);
            const data = await res.json();

            if (res.status !== 200) {
                router.push('/read');
            } else {
                const story = data.story as Story;
                setStory(story);

                const { variables: vars, bookmark } = loadBookmark(story.title);

                if (!bookmark) setCurrentPage(story.graph.nodes[0] as StoryNode);
                else setCurrentPage(story.graph.nodes.filter((n) => n.id === bookmark).at(0) as StoryNode);

                if (!vars) setVariables(story.graph.variables ?? []);
                else setVariables(vars);

                const entryNode = story.graph.nodes[0] as StoryNode;
                if (!entryNode) {
                    router.push('/read');
                    return;
                }

                saveBookmark(
                    story.title,
                    vars ?? story.graph.variables ?? [],
                    bookmark ?? story.graph.nodes[0].id
                )
            }
        });
    }, [id, router]);

    const next = (id: string) => {
        if (!story) {
            router.push('/');
            return
        }
        const nextNode = story?.graph.nodes.filter(node => node.id === id).at(0);
        if (!nextNode) return;
        setCurrentPage(nextNode as StoryNode);
        saveBookmark(story.title, variables, nextNode.id);
    }

    const saveAndQuit = () => {
        if (!story || !currentPage) {
            router.push('/');
            return
        }

        saveBookmark(story.title, variables, currentPage.id);
        router.push('/');
    }

    return (
        <div className="flex-1 flex flex-col pb-4">
            <header className="h-16 border-b flex items-center px-6">
                <button className="flex items-center gap-2 cursor-pointer" onClick={() => saveAndQuit()}>
                    <Icon icon="mdi:chevron-left-circle" className="size-8" />
                    <span className="font-bold">Quitter</span>
                </button>
            </header>

            <main className="flex flex-col flex-1 items-center gap-4 pt-4" id="parchment">
                <div className="flex-1 flex flex-col gap-4 text-justify w-[50%]">
                    { currentPage?.data.content.map((c, index) => {
                        if (c.type === 'paragraph') return (
                            <p key={index}>
                                { replaceVariables(variables ?? [], c.content) }
                            </p>
                        )

                        if (c.type === 'image') return (
                            <img key={index} src={c.content} />
                        )
                    })}
                </div>

                {
                    currentPage &&
                    story?.graph?.edges &&
                    getChoices(story?.graph.edges ?? [], currentPage, variables).map(choice => (
                        <button className="btn-primary w-[50%]" key={choice.id} onClick={() => next(choice.target)}>{choice.label}</button>
                    ))
                }
            </main>
        </div>
    )
}