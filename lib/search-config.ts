export interface SearchConfig {
  queryKey: string;
  throttleMs?: number;
}

export const talentSearchConfig: SearchConfig = {
  queryKey: "q",
  throttleMs: 500,
};

export const projectSearchPlaceholders = [
  "Search for a fintech app…",
  "Try “e-commerce dashboard”",
  "Find a Web3 wallet…",
  "Looking for a portfolio site?",
  "Search “AI chatbot” projects…",
];

export const talentSearchPlaceholders = [
  "Search for a frontend developer…",
  "Try “product designer”",
  "Find a React Native engineer…",
  "Looking for a backend dev?",
  "Search by skill, e.g. “Figma”",
];
