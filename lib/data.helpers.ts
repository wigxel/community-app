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

export const safeArray = <T>(a: Array<T> | null | undefined) =>
  Array.isArray(a)
    ? (a as NonNullable<T>[])
    : (EmptyPrimitives.Array as never[]);

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
  const value = Number.parseInt(num as string, 10);

  return !Object.is(Number.NaN, value) ? value : fallback;
}

type Values<T> = T[keyof T];

export function safeDict<const T>(opt: { map: T; default?: Values<T> }) {
  const { map, default: fallback = null } = opt;

  type TFallback = typeof opt.default;
  type InferSafeDict<TKey, TRecord, TFallback> = TKey extends keyof TRecord
    ? TRecord[TKey]
    : TFallback extends keyof TRecord
      ? TRecord[TFallback]
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
    strict<TKey extends keyof typeof map>(key: TKey): Exclude<T[TKey], null> {
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
  if (num === 0) return "00";

  if (Math.abs(num) < 10) {
    if (num < 0) {
      return `-0${Math.abs(num)}`;
    }
    return `0${num}`;
  }
  return String(num);
};

export function isObject(data: unknown): data is Record<string, unknown> {
  return Object.name === data?.constructor.name;
}
