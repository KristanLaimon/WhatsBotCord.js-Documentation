export function describe(name: string, fn: () => void | Promise<void>): void;
export function test(name: string, fn: () => void | Promise<void>): void;
export function it(name: string, fn: () => void | Promise<void>): void;

interface Matchers<T> {
  toBe(expected: T): void;
  toEqual(expected: any): void;
  toContain(expected: any): void;
  toHaveLength(expected: number): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
}

export function expect<T>(actual: T): Matchers<T>;
