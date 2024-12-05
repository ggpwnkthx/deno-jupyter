import { StoragePlugin } from "../../types.ts";
import { decode, encode } from "../../utils/keys.ts";

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
  protected store = new Map<string, Uint8Array>();

  initialize(): void {
    console.debug("MemoryStoragePlugin initialized.");
  }

  get(key: Deno.KvKey) {
    return this.store.get(encode(key)) || null;
  }

  set(key: Deno.KvKey, value: Uint8Array) {
    this.store.set(encode(key), value);
  }

  delete(key: Deno.KvKey) {
    this.store.delete(encode(key));
  }

  list(): Deno.KvKey[] {
    return Array.from(this.store.keys().map((key) => decode(key)));
  }
}
