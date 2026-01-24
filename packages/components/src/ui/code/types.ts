export type CodePoint = [line: number, column: number];

export type CodeRange = [start: CodePoint, end: CodePoint];

export type CodeSelection = CodeRange[];

export interface TokenInfo {
  text: string;
  color: string;
  line: number;
  column: number;
  opacity?: number;
}
