/**
 * A type that can represent either a value of type `T` directly, or a promise
 * that resolves to a value of type `T`.
 *
 * @example
 * ```typescript
 * const synchronousNumber: MaybeAsync<number> = 42;
 * const asynchronousNumber: MaybeAsync<number> = Promise.resolve(42);
 * ```
 *
 * @template T - The type of the underlying value.
 */
export type MaybeAsync<T> = T | Promise<T>;

export async function resolveMaybeAsync<T>(value: MaybeAsync<T>): Promise<T> {
  return value instanceof Promise ? await value : value;
}