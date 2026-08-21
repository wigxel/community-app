import { Either, pipe } from "effect";
import { safeObj } from "./data.helpers";

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
    if (result == undefined) {
      return matchers.loading?.();
    }

    return pipe(
      Result.parse(result),
      Either.match({
        onLeft: matchers.error,
        onRight: matchers.success,
      }),
    );
  },
  parse<TRight, TLeft>(
    record: ResultShape<TRight, TLeft>,
  ): ResultShape<TRight, TLeft> {
    const safe_record = safeObj(record);

    return "left" in safe_record
      ? Either.left(safe_record.left)
      : Either.right(safe_record.right);
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
