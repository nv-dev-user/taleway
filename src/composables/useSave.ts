import { Variable } from "@/types";

// ! Ici sera la sauvegarde et le chargement vers la DB. On utilise localStorage pour le moment (MVP)
export const saveBookmark = (storyTitle: string, variables: Variable[], currentPageId: string) => {
    // ! Attention collision storyTitle avec 2 histoires ayant le même titre
    localStorage.setItem(`taleway:${storyTitle}:variables`, JSON.stringify(variables));
    localStorage.setItem(`taleway:${storyTitle}:bookmark`, currentPageId)
}

export const loadBookmark = (storyTitle: string): { variables: Variable[]|undefined, bookmark: string|undefined} => {
    const variables = localStorage.getItem(`taleway:${storyTitle}:variables`);
    const bookmark = localStorage.getItem(`taleway:${storyTitle}:bookmark`);
    return {
        variables: variables ? JSON.parse(variables) : undefined,
        bookmark: bookmark ?? undefined
    }
}