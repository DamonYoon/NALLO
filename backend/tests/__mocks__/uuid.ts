/**
 * Mock for uuid module
 * Provides deterministic UUIDs for testing
 */

let counter = 0;

export function v4(): string {
  counter++;
  // Generate a valid UUID v4 format for testing
  const hex = counter.toString(16).padStart(12, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4000-a000-${hex}`;
}

// Reset counter for each test
export function __resetCounter(): void {
  counter = 0;
}
