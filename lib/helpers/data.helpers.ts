const EmptyPrimitives = Object.freeze({
  Array: [],
  Object: {
    __proto_: {
      type: "EmptyObject",
    },
  },
});

export const safeNum = (a: unknown, fallback = 0): number => {
  const value = Number(a);

  return !Object.is(Number.NaN, value) ? value : fallback;
};

export const safeArray = <T>(a?: Array<T>): Array<T | never> =>
  Array.isArray(a) ? a : EmptyPrimitives.Array;

export const safeStr = (a: unknown, fallback = ""): string =>
  typeof a === "string" ? a : fallback;

const EmptyObject: Record<string, never> = Object.freeze({});

export const safeObj = <T>(
  obj: T,
): T extends Record<string, unknown> ? T : typeof EmptyObject => {
  // @ts-expect-error I know what I'm doing
  return isObject(obj) ? obj : EmptyObject;
};

export function safeInt(num: unknown, fallback = 0): number {
  const value = Number.parseInt(num as string);

  return !Object.is(Number.NaN, value) ? value : fallback;
}

type Values<T> = T[keyof T];

export function safeDict<T>(opt: { map: T; default?: Values<T> }) {
  const { map, default: fallback = null } = opt;

  type TFallback = typeof opt.default;
  type Maybe<T> = T | undefined | null;
  type InferSafeDict<
    TKey,
    TRecord,
    TFallback,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TValues = Values<TRecord> | undefined,
  > =
    TValues extends Maybe<infer TValues>
      ? TKey extends keyof TRecord
        ? TRecord[TKey]
        : TFallback extends keyof TRecord
          ? TRecord[TFallback]
          : null
      : null;

  return {
    get: <TKey extends keyof T>(
      key: TKey,
    ): InferSafeDict<TKey, T, TFallback> | null => {
      if (key === null || key === undefined) {
        // @ts-expect-error Handled typing manually
        return fallback;
      }

      // @ts-expect-error Handled typing manually
      return map[key] ?? fallback;
    },
    strict(key: keyof typeof map) {
      if (fallback === null) {
        throw new Error("A `default` must be provided when using `strict()`");
      }

      return this.get(key);
    },
  };
}

export function numOr(value: unknown, fallback: unknown) {
  if (typeof value === "undefined") return fallback;
  if (value === null) return fallback;
  if (typeof value === "string" && value.length < 1) return fallback;

  return safeNum(value);
}

export function isNumberLike(value: unknown): value is number {
  return !Object.is(Number.NaN, value);
}

export const serialNo = (num: number): string => {
  return String(num).padStart(2, "0");
};

export function isObject(data: unknown): data is Record<string, unknown> {
  return Object.name === data?.constructor.name;
}
