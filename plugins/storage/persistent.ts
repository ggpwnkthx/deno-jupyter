import MemoryStoragePlugin from "./memory.ts";

export default class PersistentStoragePlugin extends MemoryStoragePlugin {
  private filePath: string;

  constructor(filePath: string) {
    super()
    this.filePath = filePath;
  }
  
  override async initialize(): Promise<void> {
    try {
      const data = await Deno.readTextFile(this.filePath);
      const parsed = JSON.parse(data) as Record<string, string>;
      this.store = new Map(
        Object.entries(parsed).map(([key, value]) => [
          this.deserializeKey(key),
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

  private serializeKey(key: Deno.KvKey): string {
    return btoa(JSON.stringify(key))
  }

  private deserializeKey(key: string): Deno.KvKey {
    return JSON.parse(atob(key))
  }

  override get(key: Deno.KvKey) {
    return this.store.get(key) || null;
  }

  override async set(key: Deno.KvKey, value: Uint8Array){
    this.store.set(key, value);
    await this.saveToFile();
  }

  override async delete(key: Deno.KvKey) {
    this.store.delete(key);
    await this.saveToFile();
  }

  /**
   * Saves the current state of the store to the file.
   */
  private async saveToFile(): Promise<void> {
    const obj: Record<string, string> = {};
    for (const [key, value] of this.store.entries()) {
      obj[this.serializeKey(key)] = btoa(String.fromCharCode(...value));
    }
    await Deno.writeTextFile(this.filePath, JSON.stringify(obj, null, 2));
  }
}
