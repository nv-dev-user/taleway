import { Story, StoryNode, Variable } from "@/types";

// ! Ici sera la sauvegarde vers la DB. On utilise localStorage pour le moment
export default function useSave() {
    const save = (storyTitle: string, variables: Variable[], currentPageId: string) => {
        localStorage.setItem(`taleway:${storyTitle}:variables`, JSON.stringify(variables));
        localStorage.setItem(`taleway:${storyTitle}:bookmark`, currentPageId)
    }

    const load = (storyTitle: string): { variables: Variable[]|undefined, bookmark: string|undefined} => {
        const variables = localStorage.getItem(`taleway:${storyTitle}:variables`);
        const bookmark = localStorage.getItem(`taleway:${storyTitle}:bookmark`);
        return {
            variables: variables ? JSON.parse(variables) : undefined,
            bookmark: bookmark ?? undefined
        }
    }

    return {
        save,
        load
    }
}