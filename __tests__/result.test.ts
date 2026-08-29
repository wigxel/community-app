import { Either } from "effect";
import { Result } from "~/lib/result";

describe("Result", () => {
  describe("ok", () => {
    it("creates a right Either with the given data", () => {
      const result = Result.ok(42);
      expect(result).toEqual(Either.right(42));
    });

    it("works with string data", () => {
      const result = Result.ok("hello");
      expect(result).toEqual(Either.right("hello"));
    });

    it("works with object data", () => {
      const data = { name: "test", count: 1 };
      const result = Result.ok(data);
      expect(result).toEqual(Either.right(data));
    });
  });

  describe("error", () => {
    it("creates a left Either with the given error", () => {
      const result = Result.error("fail");
      expect(result).toEqual(Either.left("fail"));
    });

    it("works with Error objects", () => {
      const err = new Error("something broke");
      const result = Result.error(err);
      expect(result).toEqual(Either.left(err));
    });
  });

  describe("match", () => {
    it("calls success matcher for a right Either", () => {
      const result = Result.ok("data");
      const output = Result.match(result, {
        success: (data) => `got: ${data}`,
        error: () => "err",
      });
      expect(output).toBe("got: data");
    });

    it("calls error matcher for a left Either", () => {
      const result = Result.error("nope");
      const output = Result.match(result, {
        success: () => "ok",
        error: (err) => `err: ${err}`,
      });
      expect(output).toBe("err: nope");
    });

    it("calls loading when result is undefined", () => {
      const output = Result.match(undefined, {
        loading: () => "loading",
        success: () => "ok",
        error: () => "err",
      });
      expect(output).toBe("loading");
    });

    it("returns undefined when result is undefined and no loading matcher", () => {
      const output = Result.match(undefined, {
        success: () => "ok",
        error: () => "err",
      });
      expect(output).toBeUndefined();
    });

    it("calls error matcher when result is null", () => {
      const output = Result.match(null, {
        success: () => "ok",
        error: (err) => `err: ${err}`,
      });
      expect(output).toBe("err: null");
    });
  });

  describe("parse", () => {
    it("returns right as-is for a valid right Either", () => {
      const result = Result.ok(10);
      const parsed = Result.parse(result);
      expect(parsed).toEqual(Either.right(10));
    });

    it("returns left as-is for a valid left Either", () => {
      const result = Result.error("boom");
      const parsed = Result.parse(result);
      expect(parsed).toEqual(Either.left("boom"));
    });

    it("returns left({}) for non-object input", () => {
      const parsed = Result.parse("not-an-either" as any);
      expect(parsed).toEqual(Either.left({}));
    });
  });

  describe("toTuple", () => {
    it("returns [data, undefined] for a right Either", () => {
      const result = Result.ok(42);
      const tuple = Result.toTuple(result);
      expect(tuple).toEqual([42, undefined]);
    });

    it("returns [undefined, error] for a left Either", () => {
      const result = Result.error("fail");
      const tuple = Result.toTuple(result);
      expect(tuple).toEqual([undefined, "fail"]);
    });
  });
});
