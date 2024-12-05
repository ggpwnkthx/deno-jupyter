import { StoragePlugin } from "../../types.ts";

export class DenoKVStoragePlugin implements StoragePlugin {
  private kv: Deno.Kv | undefined;

  constructor(private namespace: string = "default") {}
  
  async initialize(): Promise<void> {
    this.kv = await Deno.openKv();
    console.debug(`DenoKVStoragePlugin initialized with namespace: ${this.namespace}`);
  }
  
  async get(key: string): Promise<Uint8Array | null> {
    if (!this.kv) return null
    const result = await this.kv.get<Uint8Array>([this.namespace, key]);
    return result.value ?? null;
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    if (this.kv) await this.kv.set([this.namespace, key], value);
  }
  
  async delete(key: string): Promise<void> {
    if (this.kv) await this.kv.delete([this.namespace, key]);
  }
}
