import Plugin from "../mod.ts";
import StoragePlugin from "./abstract.ts";

/**
 * MemoryStoragePlugin provides an in-memory key-value storage solution.
 * It is primarily for testing and temporary storage use cases.
 *
 * Methods:
 * - initialize(): Initializes the in-memory store.
 * - get(key: string): Retrieves a value from the store.
 * - set(key: string, value: Uint8Array): Adds or updates a value in the store.
 * - delete(key: string): Removes a value from the store.
 */
export default class MemoryStoragePlugin extends Plugin implements StoragePlugin {
  protected store = new Map<string, Uint8Array>();

  get(key: string) {
    return this.store.get(key) || null;
  }

  set(key: string, value: Uint8Array) {
    this.store.set(key, value);
  }

  delete(key: string) {
    this.store.delete(key);
  }

  list(): string[] {
    return Array.from(this.store.keys());
  }
}
