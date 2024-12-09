import Plugin, { PluginRegistry } from "../mod.ts";
import StoragePlugin from "./abstract.ts";

/**
 * LocalStoragePlugin provides an key-value storage solution.
 * It is primarily for testing and temporary storage use cases.
 *
 * Methods:
 * - get(key: string): Retrieves a value from localStorage.
 * - set(key: string, value: Uint8Array): Adds or updates a value in localStorage.
 * - delete(key: string): Removes a value from localStorage.
 * - list(): Returns a list of all keys in localStorage.
 */
export default class LocalStoragePlugin extends Plugin implements StoragePlugin {
  protected store = new Map<string, Uint8Array>();

  get(key: string): Uint8Array | null {
    const value = localStorage.getItem(key);
    return value ? Uint8Array.from(atob(value), c => c.charCodeAt(0)) : null;
  }

  set(key: string, value: Uint8Array): void {
    const base64Value = btoa(String.fromCharCode(...value));
    localStorage.setItem(key, base64Value);
  }

  delete(key: string): void {
    localStorage.removeItem(key);
  }

  list(): string[] {
    return Object.keys(localStorage);
  }
}

PluginRegistry.register(LocalStoragePlugin);

Deno.readFile