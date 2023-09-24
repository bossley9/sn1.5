export type JSONDiffOperation =
  | "+" // insert
  | "-" // delete
  | "=" // equal
  | "d" // diff match patch
  | "r" // replace
  | "M"; // modify

type PrimitiveJSONDiff<T> = {
  o: JSONDiffOperation;
  v: T;
};

export type JSONDiff<T> = T extends object
  ? (T extends unknown[] ? PrimitiveJSONDiff<T> : {
    [K in keyof T]?: JSONDiff<T[K]>;
  })
  : PrimitiveJSONDiff<T>;
