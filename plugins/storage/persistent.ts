import { StoragePlugin } from "../../types.ts";

export default class PersistentStoragePlugin implements StoragePlugin {
  private filePath: string;
  private store: Map<string, Uint8Array> = new Map();

  constructor(filePath: string) {
    this.filePath = filePath;
  }
  
  async initialize(): Promise<void> {
    try {
      const data = await Deno.readTextFile(this.filePath);
      const parsed = JSON.parse(data) as Record<string, string>;
      this.store = new Map(
        Object.entries(parsed).map(([key, value]) => [
          key,
          new Uint8Array(atob(value).split("").map((c) => c.charCodeAt(0))),
        ])
      );
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // File doesn't exist, create an empty store.
        await Deno.writeTextFile(this.filePath, "{}");
        console.debug(`Created new storage file at ${this.filePath}`);
      } else {
        throw error;
      }
    }
  }

  private transformKey(key: Deno.KvKey): string {
    return key.map(part => part.toString()).join(":")
  }

  get(key: Deno.KvKey): Uint8Array | null {
    return this.store.get(this.transformKey(key)) || null;
  }

  async set(key: Deno.KvKey, value: Uint8Array): Promise<void> {
    this.store.set(this.transformKey(key), value);
    await this.saveToFile();
  }

  async delete(key: Deno.KvKey): Promise<void> {
    this.store.delete(this.transformKey(key));
    await this.saveToFile();
  }

  /**
   * Saves the current state of the store to the file.
   */
  private async saveToFile(): Promise<void> {
    const obj: Record<string, string> = {};
    for (const [key, value] of this.store.entries()) {
      obj[key] = btoa(String.fromCharCode(...value));
    }
    await Deno.writeTextFile(this.filePath, JSON.stringify(obj, null, 2));
  }
}
