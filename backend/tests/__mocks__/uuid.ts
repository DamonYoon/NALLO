/**
 * Mock for uuid module
 * Provides unique UUIDs for testing using timestamp + counter
 */

let counter = 0;

export function v4(): string {
  counter++;
  // Use timestamp + counter to generate unique UUIDs even across test runs
  const timestamp = Date.now().toString(16).slice(-8);
  const count = counter.toString(16).padStart(4, '0');
  const random = Math.random().toString(16).slice(2, 10);
  return `${timestamp}-${count}-4000-a000-${random}${count}`;
}

// Reset counter for each test
export function __resetCounter(): void {
  counter = 0;
}
