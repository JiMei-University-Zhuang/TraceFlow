import { StackFrame } from '../types';

interface ErrorWithStack {
  stack?: string;
}

export function parseStackFrames(error: Error | ErrorWithStack | unknown): StackFrame[] {
  if (!error || typeof error !== 'object' || !('stack' in error)) {
    return [];
  }

  const errorWithStack = error as ErrorWithStack;
  if (!errorWithStack.stack) {
    return [];
  }

  try {
    const stackLines = errorWithStack.stack.split('\n');
    const frames: StackFrame[] = [];

    for (let i = 1; i < stackLines.length; i++) {
      const line = stackLines[i].trim();
      if (!line) continue;

      const match = line.match(/at\s+(.*?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        frames.push({
          function: match[1],
          filename: match[2],
          lineno: parseInt(match[3], 10),
          colno: parseInt(match[4], 10),
        });
      }
    }

    return frames;
  } catch (e) {
    return [];
  }
}
