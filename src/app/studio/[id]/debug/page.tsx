"use client"

import { evaluateTriggers, getChoices, replaceVariables, setVariable } from "@/composables/useReader";
import { loadBookmark, saveBookmark } from "@/composables/useSave";
import { Story, StoryEdge, StoryNode, Variable } from "@/types";
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

                const storyVars = story.graph.variables ?? [];
                if (!vars) {
                    setVariables(storyVars);
                } else {
                    // Merge : pour chaque variable de l'histoire, utiliser la valeur sauvegardée si elle existe, sinon la valeur par défaut
                    const mergedVars = storyVars.map(storyVar => {
                        const savedVar = vars.find(v => v.label === storyVar.label);
                        return savedVar ?? storyVar;
                    });
                    setVariables(mergedVars);
                }

                const entryNode = story.graph.nodes[0] as StoryNode;
                if (!entryNode) {
                    router.push('/read');
                    return;
                }

                saveBookmark(
                    story.title,
                    storyVars.map(storyVar => {
                        const savedVar = vars?.find(v => v.label === storyVar.label);
                        return savedVar ?? storyVar;
                    }),
                    bookmark ?? story.graph.nodes[0].id
                )
            }
        });
    }, [id, router]);

    const next = (choice: StoryEdge) => {
        if (!story) {
            router.push('/');
            return
        }

        let updatedVars = variables
        for (let assignment of (choice.data.assignments ?? [])) {
            updatedVars = setVariable(updatedVars, assignment)
        }

        // Évaluer les triggers après les assignments
        const triggers = story.graph.triggers ?? []
        const { variables: triggerVars, redirectNodeId } = evaluateTriggers(triggers, updatedVars)
        updatedVars = triggerVars

        setVariables(updatedVars)

        // Si un trigger redirige, on va sur la page redirigée, sinon sur la page cible du choice
        const targetNodeId = redirectNodeId ?? choice.target
        const nextNode = story?.graph.nodes.filter(node => node.id === targetNodeId).at(0);
        if (!nextNode) return;
        setCurrentPage(nextNode as StoryNode);
        saveBookmark(story.title, updatedVars, nextNode.id);
    }

    const saveAndQuit = () => {
        if (!story || !currentPage) {
            router.push(`/studio/${id}`);
            return
        }

        saveBookmark(story.title, variables, currentPage.id);
        router.push(`/studio/${id}`);
    }

    return (
        <div className="flex-1 flex flex-col pb-4">
            <header className="h-16 border-b flex items-center px-6">
                <button className="flex items-center gap-2 cursor-pointer" onClick={() => saveAndQuit()}>
                    <Icon icon="mdi:chevron-left-circle" className="size-8" />
                    <span className="font-bold">Quitter</span>
                </button>
            </header>

            <main className="relative flex flex-1 gap-4 pt-4" id="parchment">
                <div className="flex flex-col items-center w-100 lg:w-200 xl:w-300 2xl:w-full flex-1 gap-4 overflow-auto">
                    <div className="flex-1 text-justify w-100">
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
                            <button className="btn-primary w-100" key={choice.id} onClick={() => next(choice)}>{choice.label}</button>
                        ))
                    }
                </div>

                <div className="absolute m-2 top-0 right-0 w-100 rounded-lg border overflow-auto max-h-100">
                    <table>
                        <thead className="w-full bg-gray-200 border-b">
                            <tr className="divide-x">
                                <th className="p-2 w-50">Label</th>
                                <th className="p-2 w-50">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                        { variables.length === 0 && (
                            <tr className="bg-white text-center">
                                <td colSpan={2} className="p-2">No variable to show</td>
                            </tr>
                        )}
                        { variables.map((v, index) => (
                            <tr key={index} className={`${index % 2 ? 'bg-gray-100' : 'bg-white' } ${index !== variables.length -1 ? 'border-b' : '' }`}>
                                <td className="border-r p-2">{v.label}</td>
                                <td className="p-2">{
                                    (v.type === 'boolean' ? v.value ? 'True' : 'False' : v.value)
                                }</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}