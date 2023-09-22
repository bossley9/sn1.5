import type { JSONDiff } from "./types.ts";

export function ApplyStringDiff(diff: JSONDiff<string>, src: string): string {
  if (diff.o !== "d") {
    // only able to apply Diff Match Patch diffs to strings
    return "";
  }

  const diffSegments = diff.v.split("\t");
  let startIndex = 0;
  let content = src;
  for (const diffSegment of diffSegments) {
    const { newIndex, result } = applyStringDiffSegment(
      diffSegment,
      content,
      startIndex,
    );
    startIndex = newIndex;
    content = result;
  }

  return content;
}

type DiffApplyResult = {
  newIndex: number;
  result: string;
};
function applyStringDiffSegment(
  diffSegment: string,
  src: string,
  startIndex: number,
): DiffApplyResult {
  const operation = diffSegment[0];
  let newIndex = startIndex;
  let end = "";

  switch (operation) {
    case "+": {
      const value = diffSegment.substring(1);
      end = src.substring(0, newIndex) + value + src.substring(newIndex);
      newIndex = newIndex + value.length;
      break;
    }
    case "-": {
      const value = Number(diffSegment.substring(1));
      end = src.substring(0, newIndex) + src.substring(newIndex + value);
      break;
    }
    case "=":
    default: {
      const value = Number(diffSegment.substring(1));
      newIndex = newIndex + value;
      end = src;
    }
  }

  return {
    newIndex,
    result: end,
  };
}
