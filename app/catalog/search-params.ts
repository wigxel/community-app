import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
  role: parseAsString.withDefault(""),
});
