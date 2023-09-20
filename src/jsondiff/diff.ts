export type JSONDiffOperation = "+" | "-" | "=" | "d" | "r" | "M";

type PrimitiveJSONDiff<T> = {
  o: JSONDiffOperation;
  v: T;
};

export type JSONDiff<T> = T extends object
  ? (T extends unknown[] ? PrimitiveJSONDiff<T> : {
    [K in keyof T]: JSONDiff<T[K]>;
  })
  : PrimitiveJSONDiff<T>;
