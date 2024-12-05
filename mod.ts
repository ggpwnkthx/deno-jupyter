import { StoragePlugin, SerializerPlugin, TransformerPlugin, MaybeAsync } from "./types.ts";

export default class KeyValueStore {
  private storage: StoragePlugin;
  private serializer: SerializerPlugin;
  private transformers: TransformerPlugin[];

  constructor(
    storage: StoragePlugin,
    serializer: SerializerPlugin,
    transformers: TransformerPlugin[] = []
  ) {
    this.storage = storage;
    this.serializer = serializer;
    this.transformers = transformers;
  }

  private async resolveMaybeAsync<T>(value: MaybeAsync<T>): Promise<T> {
    return value instanceof Promise ? await value : value;
  }

  async initialize(): Promise<void> {
    await this.resolveMaybeAsync(this.storage.initialize());
    await this.resolveMaybeAsync(this.serializer.initialize());
    for (const transformer of this.transformers) {
      await this.resolveMaybeAsync(transformer.initialize());
    }
  }

  async get(key: string): Promise<unknown | null> {
    const storedData = await this.resolveMaybeAsync(this.storage.get(key));
    if (!storedData) return null;

    let data = storedData;
    for (const transformer of [...this.transformers].reverse()) {
      data = await this.resolveMaybeAsync(transformer.reverse(data));
    }

    return await this.resolveMaybeAsync(this.serializer.deserialize(data));
  }

  async set(key: string, value: unknown): Promise<void> {
    let data = await this.resolveMaybeAsync(this.serializer.serialize(value));
    for (const transformer of this.transformers) {
      data = await this.resolveMaybeAsync(transformer.transform(data));
    }

    await this.resolveMaybeAsync(this.storage.set(key, data));
  }

  async delete(key: string): Promise<void> {
    await this.resolveMaybeAsync(this.storage.delete(key));
  }
}
