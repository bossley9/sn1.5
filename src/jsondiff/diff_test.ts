import { assertEquals } from "../../deps.ts";
import { GetStringDiff } from "./diff.ts";

Deno.test("GetStringDiff creates a single character diff", () => {
  const s1 = "Ted";
  const s2 = "Red";
  const ref = "-1\t+R\t=2";
  const result = GetStringDiff(s1, s2);
  assertEquals(result.v, ref);
  assertEquals(result.o, "d");
});

Deno.test("GetStringDiff reads multiple diffs", () => {
  const s1 = "the big cat walked to the store and ate";
  const s2 = "the big dog walked to the mall and ate";
  const ref = "=8\t-23\t+dog walked to the mall\t=8";
  const result = GetStringDiff(s1, s2);
  assertEquals(result.v, ref);
  assertEquals(result.o, "d");
});

Deno.test("GetStringDiff formats a diff where s2 is a substring of s1", () => {
  const s1 = "the big cat walked to the store and ate";
  const s2 = "walked";
  const ref = "-12\t=6\t-21";
  const result = GetStringDiff(s1, s2);
  assertEquals(result.v, ref);
  assertEquals(result.o, "d");
});

Deno.test("GetStringDiff formats a diff where s1 is a substring of s2", () => {
  const s1 = "walked";
  const s2 = "the big cat walked to the store and ate";
  const ref = "+the big cat \t=6\t+ to the store and ate";
  const result = GetStringDiff(s1, s2);
  assertEquals(result.v, ref);
  assertEquals(result.o, "d");
});

Deno.test("GetStringDiff formats a diff with only a single deletion in the center", () => {
  const s1 = "XYZ ABC XYSSBC XYZ ABC";
  const s2 = "XYZ ABC XYZ ABC";
  const ref = "=10\t-7\t=5";
  const result = GetStringDiff(s1, s2);
  assertEquals(result.v, ref);
  assertEquals(result.o, "d");
});

Deno.test("GetStringDiff formats a diff with two identical strings", () => {
  const s1 = "the big cat walked to the store and ate";
  const s2 = "the big cat walked to the store and ate";
  const ref = "";
  const result = GetStringDiff(s1, s2);
  assertEquals(result.v, ref);
  assertEquals(result.o, "d");
});
