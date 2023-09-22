import { assertEquals } from "../../deps.ts";
import { ApplyStringDiff } from "./apply.ts";
import type { JSONDiff } from "./types.ts";

Deno.test("ApplyStringDiff applies a routine diff", () => {
  const test = "Ted";
  const ref = "Red";
  const diff: JSONDiff<string> = {
    o: "d",
    v: "-1\t+R\t=2",
  };
  assertEquals(ApplyStringDiff(diff, test), ref);
});

Deno.test("ApplyStringDiff applies multiple diffs", () => {
  const test = "the big cat walked to the store and ate";
  const ref = "the big dog walked to the mall and ate";
  const diff: JSONDiff<string> = {
    o: "d",
    v: "=8\t-3\t+dog\t=15\t-5\t+mall\t=8",
  };
  assertEquals(ApplyStringDiff(diff, test), ref);
});
