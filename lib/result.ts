import { Either, pipe } from "effect";
import { isRecord } from "effect/Predicate";

export type ResultShape<TData, TError = never> = Either.Either<TData, TError>;

export const Result = {
  ok: <TData>(data: TData) => {
    return Either.right(data);
  },

  error: <TError>(error: TError) => {
    return Either.left(error);
  },

  match: <TData, TError, TLoading, TSuccess, TErrorResult>(
    result: ResultShape<TData, TError> | null | undefined,
    matchers: {
      loading?: () => TLoading;
      success: (data: TData) => TSuccess;
      error: (error: TError) => TErrorResult;
    },
  ) => {
    type Matchers = typeof matchers;

    if (result === undefined) {
      return matchers.loading?.() as keyof Matchers extends "loading"
        ? TLoading
        : undefined;
    }

    if (result === null) {
      return matchers.error(result as TError) as TErrorResult;
    }

    return pipe(
      Result.parse(result),
      Either.match({
        onLeft: matchers.error,
        onRight: matchers.success,
      }),
    ) as TSuccess | TErrorResult;
  },

  parse<TRight, TLeft>(
    record: ResultShape<TRight, TLeft>,
  ): ResultShape<TRight, TLeft> {
    if (!isRecord(record)) {
      return Either.left({} as TLeft);
    }

    const r = record as Record<string, unknown>;

    return "left" in r
      ? Either.left(r.left as TLeft)
      : Either.right(r.right as TRight);
  },

  toTuple: <TData, TError = unknown>(result: ResultShape<TData, TError>) => {
    return result.pipe(
      Either.match({
        onLeft: (error) => [undefined, error] as const,
        onRight: (data) => [data, undefined] as const,
      }),
    );
  },
};
