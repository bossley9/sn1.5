import type { JSONDiff, JSONDiffOperation } from "./types.ts";

/**
 * See Neil Fraser's implementation:
 * https://raw.githubusercontent.com/google/diff-match-patch/master/javascript/diff_match_patch_uncompressed.js
 */
export function GetStringDiff(s1: string, s2: string): JSONDiff<string> {
  const op: JSONDiffOperation = "d";

  // speedup (equality)
  if (s1 === s2) {
    return {
      o: op,
      v: "",
    };
  }
  // speedup (complete insertion)
  if (s1.length === 0) {
    return {
      o: op,
      v: "+" + s1,
    };
  }
  // speedup (complete deletion)
  if (s2.length === 0) {
    return {
      o: op,
      v: `-${s2.length}`,
    };
  }

  const operations: string[] = [];

  // speedup (common prefix/suffix)
  const { d1, d2, prefix, suffix } = trimCommon(s1, s2);

  if (prefix.length > 0) {
    const prefixOp = `=${prefix.length}`;
    operations.push(prefixOp);
  }

  const dmpOperations = computeDiff(d1, d2);
  for (const dmpDiff of dmpOperations) {
    operations.push(dmpDiff);
  }

  if (suffix.length > 0) {
    const suffixOp = `=${suffix.length}`;
    operations.push(suffixOp);
  }

  return {
    o: op,
    v: operations.join("\t"),
  };
}

/**
 * given strings s1 and s2, trims common prefixes and suffixes and returns all strings
 */
type TrimCommonResult = {
  d1: string;
  d2: string;
  prefix: string;
  suffix: string;
};
function trimCommon(
  s1: string,
  s2: string,
): TrimCommonResult {
  const s1len = s1.length;
  const s2len = s2.length;

  let minLen = s1len;
  if (s2len < s1len) {
    minLen = s2len;
  }

  let prefixIndex = 0;
  for (prefixIndex; prefixIndex < minLen; prefixIndex++) {
    if (s1[prefixIndex] !== s2[prefixIndex]) {
      break;
    }
  }

  let suffixLen = 0;
  // minLen-prefixIndex prevents overlap
  for (suffixLen; suffixLen < minLen - prefixIndex; suffixLen++) {
    if (s1[s1len - 1 - suffixLen] !== s2[s2len - 1 - suffixLen]) {
      break;
    }
  }

  return {
    d1: s1.substring(prefixIndex, s1len - suffixLen),
    d2: s2.substring(prefixIndex, s2len - suffixLen),
    prefix: s1.substring(0, prefixIndex),
    suffix: s1.substring(s1len - suffixLen),
  };
}

function computeDiff(s1: string, s2: string): string[] {
  const s1len = s1.length;
  const s2len = s2.length;

  // speedup (insertion)
  if (s1len === 0) {
    return [`+${s2}`];
  }

  // speedup (deletion)
  if (s2len === 0) {
    return [`-${s1len}`];
  }

  // speedup (s2 within s1)
  const s1Index = s1.indexOf(s2);
  if (s1Index >= 0) {
    return [
      `-${s1.substring(0, s1Index).length}`,
      `=${s2len}`,
      `-${s1.substring(s1Index + s2len).length}`,
    ];
  }

  // speedup (s1 within s2)
  const s2Index = s2.indexOf(s1);
  if (s2Index >= 0) {
    return [
      `+${s2.substring(0, s2Index)}`,
      `=${s1len}`,
      `+${s2.substring(s2Index + s1len)}`,
    ];
  }

  // speedup (single character - after substring index speedup)
  if (s1len === 1) {
    return [
      "-1",
      `+${s2}`,
    ];
  }

  // speedup (single character - after substring index speedup)
  if (s2len === 1) {
    return [`-${s1len}`, "+1"];
  }

  // future: half match: find a substring shared by both strings at least half the length of the bigger text

  // future: line mode (half match wasn't enough): compare lines of text if diff is really large (>100 lines)

  // future: bisect (adhering to Myers 1986 diff algorithm)

  // TEMP: swap and replace (inefficient - but I can't be bothered right now)
  return swapAndReplace(s1, s2);
}

function swapAndReplace(s1: string, s2: string): string[] {
  const deleteDiff = `-${s1.length}`;
  const insertDiff = `+${s2}`;
  return [deleteDiff, insertDiff];
}
