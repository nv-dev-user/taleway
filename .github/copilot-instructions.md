@AGENTS.md

# Taleway - Instructions pour l'Agent IA (Copilot / Ollama)

## 1. Vue d'ensemble du projet (Vision Finale)

**Taleway** est une plateforme de création et de lecture d'histoires interactives (Gamebooks / Livres dont vous êtes le héros).
L'application se divise en deux parties :

1. **L'Éditeur :** Un graphe interactif basé sur `xyflow` (React Flow).
2. **Le Lecteur :** Une interface de lecture personnalisable par le créateur.

### Fonctionnalités finales visées :

- **Variables :** Numériques, booléennes, textuelles. Peuvent être visibles ou invisibles au lecteur.
- **Structure :** Point d'entrée, pages (avec ou sans choix), points de sortie (fins).
- **Contenu multimédia :** Pages pouvant inclure des images et des sons.
- **Événements :** Déclencheurs logiques basés sur les variables et les actions du lecteur.
- **Customisation UI (Lecteur) :** Le créateur peut customiser les boutons, le header, et la "page d'info" (où s'affichent les variables visibles, cartes, textes, etc.).
- **Metadata :** Gestion des métadonnées de l'histoire.

**Phase actuelle :** MVP. L'interface de l'éditeur est volontairement "moche" et minimaliste (style brut) pour tester la logique. Le design avancé viendra plus tard.

## 2. Stack Technique

- **Framework :** Next.js (App Router) - TypeScript obligatoire.
- **Frontend UI :** React + TailwindCSS.
- **Éditeur Graphe :** `@xyflow/react` (React Flow v12).
- **Base de données :** SQLite (MVP) puis Supabase (dev & prod).
- **ORM** : Drizzle.
- **Hébergement :** Vercel (Domaine: taleway.co).

## 3. Architecture & Structure des dossiers (Évolutive)

```text
/src
  /app
    /editor
    /read
    /api
      /stories
        route.ts         -> POST (créer), GET (lister)
        /[id]
          route.ts       -> GET (récupérer), PUT (sauvegarder le graphe & metadata)
  /components
    /editor
      PageNode.tsx       -> Nœud de page (contenu, médias, fin)
      EventNode.tsx      -> Nœud d'événement (logique/variables)
      VariablePanel.tsx  -> Gestion des variables de l'histoire
    /reader
      ChoiceButton.tsx   -> Boutons de choix customisables
      ReaderHeader.tsx   -> Header du lecteur
      InfoPanel.tsx      -> Page d'info (variables visibles, infos additionnelles)
  /lib
    db.ts                -> Logique de connexion DB
    types.ts             -> Types TypeScript (à construire progressivement)
```

## 4. Modèle de Données (Concepts - À affinir étape par étape)

*Attention : Ne pas verrouiller le schéma SQL définitif tout de suite. Privilégier des structures flexibles (ex: stockage JSON pour les états complexes) au début du MVP.*

- **Story :** Metadata, paramètres de customisation UI (header, boutons), point d'entrée.
- **Variables :** Définies au niveau de l'histoire. Type (num, bool, text), Valeur par défaut, Visibilité (public/privé).
- **Nodes (Pages/Événements) :** Position dans xyflow.
  - *Si Page :* Texte, liens médias (image/son), indicateur de fin (point de sortie).
  - *Si Événement :* Logique de modification de variables.
- **Edges (Choix/Transitions) :** Source, Target, Label (texte du bouton), conditions d'affichage (basées sur les variables).

## 5. Règles de Codage pour l'IA (Strict)

1. **TypeScript Strict :** Toujours typer les props, les states et les retours d'API. Pas de `any`.
2. **App Router Only :** Utiliser les Server Components par défaut. N'utiliser `'use client'` QUE pour les pages nécessitant des hooks React (éditeur xyflow, lecteur interactif).
3. **Gestion d'état xyflow :** Utiliser `useNodesState` et `useEdgesState` de `@xyflow/react`.
4. **Minimalisme UI :** NE PAS ajouter de bibliothèques UI complexes (Material UI, Chakra). Utiliser uniquement TailwindCSS avec des classes basiques (`border`, `p-4`, `flex`, `flex-col`).
5. **Approche progressive :** Ne pas coder toutes les fonctionnalités finales d'un coup. Suivre les instructions du développeur étape par étape (ex: "Aujourd'hui on fait juste les pages texte", "Aujourd'hui on ajoute les variables booléennes").
6. **Sauvegarde :** La sauvegarde du graphe de l'éditeur doit se faire via un appel `fetch` vers `/api/stories/[id]`.
7. **Validation :** Sans validation de l'utilisateur, l'agent NE PEUT PAS et NE DOIT PAS coder !!

## 6. Comportement de l'Agent

- **Ne pas anticiper :** Ne code pas les événements complexes ou la customisation UI tant que le développeur ne te le demande pas explicitement.
- **Validation :** Demande toujours, toujours, toujours une validation par écrit si l'utilisateur veut, oui ou non, que tu codes ce qu'il a demandé. Si non, tu réponds seulement à la question en codant dans le tchat s'il le faut !!
