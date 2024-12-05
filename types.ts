/**
 * Represents a value that can be either synchronous or asynchronous.
 *
 * Example Usage:
 * ```typescript
 * const syncValue: MaybeAsync<number> = 42;
 * const asyncValue: MaybeAsync<number> = Promise.resolve(42);
 * ```
 *
 * @template T - The type of the value.
 */
export type MaybeAsync<T> = T | Promise<T>; 

/**
 * The base interface for all plugins in the system. Plugins can perform
 * various tasks like storage, serialization, or transformation. Every plugin
 * must implement the `initialize` method.
 *
 * Methods:
 * - `initialize()`: Initializes the plugin and prepares it for use.
 *
 * Example:
 * ```typescript
 * class ExamplePlugin implements Plugin {
 *   initialize(): void {
 *     console.log("Plugin initialized");
 *   }
 * }
 * ```
 */
export type Plugin = {
  /**
   * Initializes the plugin by loading the existing data from the file
   * or creating a new file if it doesn't exist.
   */
  initialize(): MaybeAsync<void>;
};

/**
 * Interface for key-value storage plugins. These plugins manage the storage
 * of data and provide basic CRUD operations.
 *
 * Methods:
 * - `initialize()`: Prepares the storage plugin for use.
 * - `get(key: string): MaybeAsync<Uint8Array | null>`: Retrieves the value
 *   associated with the given key, or `null` if the key does not exist.
 * - `set(key: string, value: Uint8Array): MaybeAsync<void>`: Stores the given
 *   value under the specified key.
 * - `delete(key: string): MaybeAsync<void>`: Deletes the value associated
 *   with the specified key.
 *
 * Example Implementation:
 * ```typescript
 * class MemoryStoragePlugin implements StoragePlugin {
 *   private store = new Map<string, Uint8Array>();
 *   initialize(): void { console.log("Memory storage initialized."); }
 *   get(key: string): Uint8Array | null { return this.store.get(key) || null; }
 *   set(key: string, value: Uint8Array): void { this.store.set(key, value); }
 *   delete(key: string): void { this.store.delete(key); }
 * }
 * ```
 */
export type StoragePlugin = Plugin & {
  /**
   * Retrieves the value associated with the given key.
   *
   * @param key - The key to retrieve.
   * @returns The stored value as Uint8Array or null if the key does not exist.
   */
  get(key: Deno.KvKey): MaybeAsync<Uint8Array | null>;
  /**
   * Stores the given value under the specified key.
   *
   * @param key - The key to store the value under.
   * @param value - The value to store as Uint8Array.
   */
  set(key: Deno.KvKey, value: Uint8Array): MaybeAsync<void>;
  /**
   * Deletes the value associated with the specified key.
   *
   * @param key - The key to delete.
   */
  delete(key: Deno.KvKey): MaybeAsync<void>;

  list(): MaybeAsync<Deno.KvKey[]>;
};

/**
 * Interface for plugins that handle data serialization and deserialization.
 * These plugins convert data to and from a storable format, typically
 * Uint8Array.
 *
 * Methods:
 * - `initialize()`: Prepares the serializer plugin for use.
 * - `serialize(data: unknown): MaybeAsync<Uint8Array>`: Converts the given
 *   data into a storable format (e.g., JSON to Uint8Array).
 * - `deserialize(data: Uint8Array): MaybeAsync<unknown>`: Converts stored
 *   data back into its original form (e.g., Uint8Array to JSON).
 *
 * Example Implementation:
 * ```typescript
 * class JSONSerializerPlugin implements SerializerPlugin {
 *   initialize(): void { console.log("JSON serializer initialized."); }
 *   serialize(data: unknown): Uint8Array {
 *     return new TextEncoder().encode(JSON.stringify(data));
 *   }
 *   deserialize(data: Uint8Array): unknown {
 *     return JSON.parse(new TextDecoder().decode(data));
 *   }
 * }
 * ```
 */
export type SerializerPlugin = Plugin & {
  serialize(data: unknown): MaybeAsync<Uint8Array>;
  deserialize(data: Uint8Array): MaybeAsync<unknown>;
};

/**
 * Interface for plugins that transform data. Transformations can include
 * compression, encryption, or other modifications to the data before storage
 * or after retrieval.
 *
 * Methods:
 * - `initialize()`: Prepares the transformer plugin for use.
 * - `transform(data: Uint8Array): MaybeAsync<Uint8Array>`: Applies a forward
 *   transformation to the given data (e.g., encryption, compression).
 * - `reverse(data: Uint8Array): MaybeAsync<Uint8Array>`: Reverses the
 *   transformation applied by the `transform` method (e.g., decryption,
 *   decompression).
 *
 * Example Implementation:
 * ```typescript
 * class CompressionTransformerPlugin implements TransformerPlugin {
 *   initialize(): void { console.log("Compression initialized."); }
 *   async transform(data: Uint8Array): Promise<Uint8Array> {
 *     // Example: Compress data
 *     return compressedData;
 *   }
 *   async reverse(data: Uint8Array): Promise<Uint8Array> {
 *     // Example: Decompress data
 *     return decompressedData;
 *   }
 * }
 * ```
 */
export type TransformerPlugin = Plugin & {
  transform(data: Uint8Array): MaybeAsync<Uint8Array>;
  reverse(data: Uint8Array): MaybeAsync<Uint8Array>;
};
