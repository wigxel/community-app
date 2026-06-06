import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { safeArray } from "~/lib/data.helpers";

export function useTitles() {
  const titles = useQuery(api.titles.listTitles);

  const safeTitles = safeArray(titles);

  const getTitleId = (role: string) => {
    if (role) {
      const title = safeTitles.find(
        (title) => title.name.toLowerCase() === role.toLowerCase(),
      );

      return title?._id;
    }
    return;
  };

  return {
    titles: safeTitles,
    getTitleId,
  };
}
