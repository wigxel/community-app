export interface SearchConfig {
  queryKey: string;
  throttleMs?: number;
}

export const projectSearchConfig: SearchConfig = {
  queryKey: "q",
  throttleMs: 500,
};

export const talentSearchConfig: SearchConfig = {
  queryKey: "q",
  throttleMs: 500,
};
