/**
 * A type that can represent either a value of type `T` directly, or a promise
 * that resolves to a value of type `T`.
 *
 * @example
 * ```typescript
 * const synchronousNumber: MaybeAsync<number> = 42;
 * const asynchronousNumber: MaybeAsync<number> = Promise.resolve(42);
 * ```
 *
 * @template T - The type of the underlying value.
 */
export type MaybeAsync<T> = T | Promise<T>;

/**
 * The fundamental interface for all plugins. A plugin encapsulates specific
 * functionality—such as storage, serialization, or transformation—and must
 * implement the `initialize` method to prepare itself for use.
 *
 * @example
 * ```typescript
 * class MyPlugin implements Plugin {
 *   initialize(): void {
 *     console.log("MyPlugin has been initialized.");
 *   }
 * }
 * ```
 */
export type Plugin = {
  /**
   * Prepares the plugin for operation. For example, this might involve
   * loading initial data, setting up connections, or allocating resources.
   * This method should be called before using other plugin methods.
   */
  initialize(): MaybeAsync<void>;
};

/**
 * A specialization of `Plugin` that manages key-value storage operations.
 * Storage plugins support basic CRUD methods for retrieving, storing, and
 * removing data, as well as listing all available keys.
 *
 * @example
 * ```typescript
 * class InMemoryStoragePlugin implements StoragePlugin {
 *   private store = new Map<string, Uint8Array>();

 *   initialize(): void {
 *     console.log("In-memory storage initialized.");
 *   }

 *   get(key: string): Uint8Array | null {
 *     return this.store.get(key) ?? null;
 *   }

 *   set(key: string, value: Uint8Array): void {
 *     this.store.set(key, value);
 *   }

 *   delete(key: string): void {
 *     this.store.delete(key);
 *   }

 *   list(): string[] {
 *     return Array.from(this.store.keys());
 *   }
 * }
 * ```
 */
export type StoragePlugin = Plugin & {
  /**
   * Retrieves the value associated with the specified key.
   *
   * @param key - The key to look up.
   * @returns The corresponding `Uint8Array` value, or `null` if no value is found.
   */
  get(key: string): MaybeAsync<Uint8Array | null>;

  /**
   * Stores a given `Uint8Array` under the specified key, overwriting any
   * existing value.
   *
   * @param key - The key to associate with the stored value.
   * @param value - The data to store.
   */
  set(key: string, value: Uint8Array): MaybeAsync<void>;

  /**
   * Removes the value associated with the given key.
   *
   * @param key - The key whose associated value should be removed.
   */
  delete(key: string): MaybeAsync<void>;

  /**
   * Returns a list of all keys currently stored.
   *
   * @returns An array of keys as strings.
   */
  list(): MaybeAsync<string[]>;
};

/**
 * A plugin interface for converting arbitrary data into a format suitable
 * for storage (e.g., converting objects to `Uint8Array`) and restoring it
 * back to its original form. This typically involves encoding and decoding
 * data structures, such as JSON serialization and deserialization.
 *
 * @example
 * ```typescript
 * class JSONSerializerPlugin implements SerializerPlugin {
 *   initialize(): void {
 *     console.log("JSONSerializerPlugin initialized.");
 *   }

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
  /**
   * Serializes the provided data into a `Uint8Array`. For example, you might
   * convert a JavaScript object to a JSON string, then encode that string.
   *
   * @param data - The data to serialize.
   * @returns A `Uint8Array` representing the serialized data.
   */
  serialize(data: unknown): MaybeAsync<Uint8Array>;

  /**
   * Deserializes the given `Uint8Array` back into its original form.
   * For example, decode a JSON string and parse it into a JavaScript object.
   *
   * @param data - The serialized `Uint8Array` to be deserialized.
   * @returns The original data structure.
   */
  deserialize(data: Uint8Array): MaybeAsync<unknown>;
};

/**
 * A plugin interface for transforming data. Transformations might include
 * actions like compression, encryption, or other modifications that can be
 * applied before storing data or after retrieving it. Implementations must
 * also provide a method to reverse the applied transformation.
 *
 * @example
 * ```typescript
 * class CompressionTransformerPlugin implements TransformerPlugin {
 *   initialize(): void {
 *     console.log("CompressionTransformerPlugin initialized.");
 *   }

 *   async transform(data: Uint8Array): Promise<Uint8Array> {
 *     // Compress the data before storage
 *     return compressedData;
 *   }

 *   async reverse(data: Uint8Array): Promise<Uint8Array> {
 *     // Decompress the data after retrieval
 *     return decompressedData;
 *   }
 * }
 * ```
 */
export type TransformerPlugin = Plugin & {
  /**
   * Applies a forward transformation to the provided data. For instance,
   * this could involve encrypting or compressing the input.
   *
   * @param data - The data to transform.
   * @returns A `Uint8Array` that represents the transformed data.
   */
  transform(data: Uint8Array): MaybeAsync<Uint8Array>;

  /**
   * Reverses the transformation applied by the `transform` method, restoring
   * the original data. For example, decrypting or decompressing the transformed data.
   *
   * @param data - The transformed data.
   * @returns The original, untransformed `Uint8Array`.
   */
  reverse(data: Uint8Array): MaybeAsync<Uint8Array>;
};
