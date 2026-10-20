export interface SearchConfig {
  queryKey: string;
  throttleMs?: number;
}

export const talentSearchConfig: SearchConfig = {
  queryKey: "q",
  throttleMs: 500,
};
