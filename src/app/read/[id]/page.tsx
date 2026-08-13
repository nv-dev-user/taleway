"use client"

import useNode from "@/composables/useNode";
import useSave from "@/composables/useSave";
import { Story, StoryNode, Variable } from "@/types";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

export default function ReadPage() {
    const { id } = useParams();

    const noder = useNode();
    const saver = useSave();
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

                const { variables: vars, bookmark } = saver.load(story.title);

                if (!bookmark) setCurrentPage(story.graph.nodes[0] as StoryNode);
                else setCurrentPage(story.graph.nodes.filter((n) => n.id === bookmark).at(0) as StoryNode);

                if (!vars) setVariables(story.graph.variables ?? []);
                else setVariables(vars);

                const entryNode = story.graph.nodes[0] as StoryNode;
                if (!entryNode) {
                    router.push('/read');
                    return;
                }

                saver.save(
                    story.title,
                    vars ?? story.graph.variables ?? [],
                    bookmark ?? story.graph.nodes[0].id
                )
            }
        });
    }, [id]);

    const next = (id: string) => {
        if (!story) {
            router.push('/');
            return
        }
        const nextNode = story?.graph.nodes.filter(node => node.id === id).at(0);
        if (!nextNode) return;
        setCurrentPage(nextNode as StoryNode);
        saver.save(story.title, variables, nextNode.id);
    }

    const saveAndQuit = () => {
        if (!story || !currentPage) {
            router.push('/');
            return
        }

        saver.save(story.title, variables, currentPage.id);
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

            <main className="flex flex-col flex-1 gap-4 text-justify pt-4" id="parchment">
                <div className="flex-1 flex flex-col gap-4">
                    { currentPage?.data.content.map((c, index) => {
                        if (c.type === 'paragraph') return (
                            <p key={index}>
                                { noder.replaceVariables(variables ?? [], c.content) }
                            </p>
                        )
                    })}
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