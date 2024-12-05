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

  private transformKey(key: Deno.KvKey): string {
    return key.map(part => part.toString()).join(":")
  }

  get(key: Deno.KvKey): Uint8Array | null {
    return this.store.get(this.transformKey(key)) || null;
  }

  set(key: Deno.KvKey, value: Uint8Array): void {
    this.store.set(this.transformKey(key), value);
  }

  delete(key: Deno.KvKey): void {
    this.store.delete(this.transformKey(key));
  }
}
