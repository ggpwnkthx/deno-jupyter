import MemoryStoragePlugin from "./memory.ts";

export default class PersistentStoragePlugin extends MemoryStoragePlugin {
  private filePath: string;

  constructor(config: { filePath: string }) {
    super()
    this.filePath = config.filePath;
  }
  
  override async initialize(): Promise<void> {
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

  override async set(key: string, value: Uint8Array){
    super.set(key, value);
    await this.saveToFile();
  }

  override async delete(key: string) {
    super.delete(key);
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
