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

Deno.test("ApplyStringDiff applies encoded diffs", () => {
  const test = "the big cat walked to the store";
  const ref = `the "brown" cat walked to the store
(and lived happily ever after)`;
  const diff: JSONDiff<string> = {
    o: "d",
    v: "=4\t-3\t+%22brown%22\t=24\t+%0A%28and%20lived%20happily%20ever%20after%29",
  };
  assertEquals(ApplyStringDiff(diff, test), ref);
});
