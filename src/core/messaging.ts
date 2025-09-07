import type { PlayerMessage } from '../types';

/** Parses WebView messages safely */
export function parseMessage(data: string): PlayerMessage | null {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
