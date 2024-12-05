import { StoragePlugin } from "../../types.ts";

export class MemoryStoragePlugin implements StoragePlugin {
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
