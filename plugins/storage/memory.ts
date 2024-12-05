import { StoragePlugin } from "../../types.ts";

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
export default class MemoryStoragePlugin implements StoragePlugin {
  private store = new Map<string, Uint8Array>();

  initialize(): void {
    console.debug("MemoryStoragePlugin initialized.");
  }

  get(key: string): Uint8Array | null {
    return this.store.get(key) || null;
  }

  set(key: string, value: Uint8Array): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}
