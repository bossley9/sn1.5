import { assertEquals } from "../../deps.ts";
import { generateID } from "./note.ts";

Deno.test("generateID generates a routine ID", () => {
  const test = `# New section, here! Now!
content line
`;
  const ref = "new-section-here-now";
  assertEquals(generateID(test), ref);
});

Deno.test("generateID generates an ID of max length", () => {
  const test =
    "# New section, here! Now! This is more of the title and will eventually be cut off at some point";
  const ref = "new-section-here-now-this-is-mor";
  assertEquals(generateID(test), ref);
});

Deno.test("generateID generates an ID with a trailing hyphen", () => {
  const test = "# New section, here! Now! This is it for you";
  const ref = "new-section-here-now-this-is-it";
  assertEquals(generateID(test), ref);
});
