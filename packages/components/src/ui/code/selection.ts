// lines(2); // Select line 2
// lines(2, 5); // Select lines 2 through 5

import { CodePoint, CodeRange, CodeSelection } from "./types";

export function lines(from: number, to?: number): CodeSelection {
  const endLine = to !== undefined ? to : from;
  return [
    [
      [from, 0],
      [endLine, Infinity],
    ],
  ];
}

// word(3, 10, 5)  // Line 3, starting at column 10, length 5
// word(3, 10)     // Line 3, from column 10 to end of line

export function word(
  line: number,
  from: number,
  length?: number
): CodeSelection {
  const endColumn = length !== undefined ? from + length : Infinity;
  return [
    [
      [line, from],
      [line, endColumn],
    ],
  ];
}

// Create a function that checks if a point is within a range. This is essential for applying selection opacity.

export function isPointInRange(point: CodePoint, range: CodeRange): boolean {
  const [line, column] = point;
  const [[startLine, startColumn], [endLine, endColumn]] = range;

  // Before the range
  if (line < startLine || (line === startLine && column < startColumn)) {
    return false;
  }

  // After the range
  if (line > endLine || (line === endLine && column > endColumn)) {
    return false;
  }

  // Within the range
  return true;
}

export function findAllCodeRanges(
  code: string,
  pattern: string | RegExp,
  limit?: number
): CodeRange[] {
  const lines = code.split("\n");
  const ranges: CodeRange[] = [];

  // Escape special regex characters if pattern is a string
  const regex =
    typeof pattern === "string"
      ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
      : new RegExp(pattern.source, "g");

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      const startCol = match.index;
      const endCol = startCol + match[0].length;

      ranges.push([
        [lineIndex, startCol],
        [lineIndex, endCol],
      ]);

      if (limit !== undefined && ranges.length >= limit) {
        return ranges;
      }

      // Prevent infinite loop for zero-length matches
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }

    // Reset regex for next line
    regex.lastIndex = 0;
  }

  return ranges;
}
