import SerializerPlugin from "./plugins/serializer/abstract.ts";
import StoragePlugin from "./plugins/storage/abstract.ts";
import TransformerPlugin from "./plugins/transformer/abstract.ts";
import { resolveMaybeAsync } from "./utils/maybe.ts";

/**
 * KeyValueStore class provides a flexible interface for working with key-value storage.
 * It supports plugins for storage, serialization, and transformation to allow
 * custom handling of data. The class is designed to support both synchronous
 * and asynchronous operations.
 *
 * Methods:
 * - initialize(): Prepares all plugins for use.
 * - get(key: string): Retrieves a deserialized value from the store.
 * - set(key: string, value: unknown): Stores a serialized value in the store.
 * - delete(key: string): Removes an item from the store.
 */
export default class KeyValueStore {
  protected storage: StoragePlugin;
  protected serializer: SerializerPlugin;
  protected transformers: TransformerPlugin[];

  constructor(
    storage: StoragePlugin,
    serializer: SerializerPlugin,
    transformers: TransformerPlugin[] = []
  ) {
    this.storage = storage;
    this.serializer = serializer;
    this.transformers = transformers;
  }

  async initialize(): Promise<void> {
    await resolveMaybeAsync(this.storage.initialize());
    await resolveMaybeAsync(this.serializer.initialize());
    for (const transformer of this.transformers) {
      await resolveMaybeAsync(transformer.initialize());
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const storedData = await resolveMaybeAsync(this.storage.get(key));
    if (!storedData) return null;

    let data = storedData;
    for (const transformer of [...this.transformers].reverse()) {
      data = await resolveMaybeAsync(transformer.reverse(data));
    }
    return await resolveMaybeAsync(this.serializer.deserialize(data));
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    let data = await resolveMaybeAsync(this.serializer.serialize(value));
    for (const transformer of this.transformers) {
      data = await resolveMaybeAsync(transformer.transform(data));
    }

    await resolveMaybeAsync(this.storage.set(key, data));
  }

  async delete(key: string): Promise<void> {
    await resolveMaybeAsync(this.storage.delete(key));
  }

  async list(): Promise<string[]> {
    return await resolveMaybeAsync(this.storage.list())
  }
}
