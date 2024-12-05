import { MaybeAsync } from "../types.ts";

export async function resolveMaybeAsync<T>(value: MaybeAsync<T>): Promise<T> {
  return value instanceof Promise ? await value : value;
}