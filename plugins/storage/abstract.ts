import Plugin from "../mod.ts";
import { MaybeAsync } from "../../utils/maybe.ts";

export default abstract class StoragePlugin extends Plugin {
  /**
   * Retrieves the value associated with the specified key.
   *
   * @param key - The key to look up.
   * @returns The corresponding `Uint8Array` value, or `null` if no value is found.
   */
  abstract get(key: string): MaybeAsync<Uint8Array | null>;

  /**
   * Stores a given `Uint8Array` under the specified key.
   *
   * @param key - The key to associate with the stored value.
   * @param value - The data to store.
   */
  abstract set(key: string, value: Uint8Array): MaybeAsync<void>;

  /**
   * Removes the value associated with the given key.
   *
   * @param key - The key whose associated value should be removed.
   */
  abstract delete(key: string): MaybeAsync<void>;

  /**
   * Returns a list of all keys currently stored.
   *
   * @returns An array of keys as strings.
   */
  abstract list(): MaybeAsync<string[]>;
}
