import { assertEquals } from "jsr:@std/assert";
import KeyValueStore from "./mod.ts";
import MemoryStoragePlugin from "./plugins/storage/memory.ts";
import PersistentStoragePlugin from "./plugins/storage/persistent.ts";
import JSONSerializerPlugin from "./plugins/serializer/json.ts";
import CompressionTransformerPlugin from "./plugins/transformer/compression.ts";
import EncryptionTransformerPlugin from "./plugins/transformer/encryption.ts";

// Define all plugins
const storagePlugins = [
  new MemoryStoragePlugin(),
  new PersistentStoragePlugin("./test-cache.json"),
];

const serializerPlugins = [
  new JSONSerializerPlugin(),
];

const transformerPlugins = [
  new CompressionTransformerPlugin(),
  new EncryptionTransformerPlugin("my-secret-key"),
];

// Function to generate a random key
function generateRandomKey(): Deno.KvKey {
  return ["test", "key", crypto.randomUUID()];
}

// Test value with diverse data types
const testValue = {
  string: "hello",
  number: 42,
  boolean: true,
  array: [1, 2, 3],
  object: { nested: "value" },
  nullValue: null,
  // date: new Date(),
};

// Generate tests dynamically
for (const storage of storagePlugins) {
  for (const serializer of serializerPlugins) {
    // Test without transformers
    Deno.test(
      `Storage=${storage.constructor.name}, Serializer=${serializer.constructor.name}, No Transformers`,
      async () => {
        const testKey = generateRandomKey();

        const store = new KeyValueStore(storage, serializer, []);
        await store.initialize();

        await store.set(testKey, testValue);
        const retrievedValue = await store.get(testKey);

        assertEquals(retrievedValue, testValue, "Retrieved value should match original");
      },
    );

    // Test with each transformer combination
    for (const transformer of transformerPlugins) {
      Deno.test(
        `Storage=${storage.constructor.name}, Serializer=${serializer.constructor.name}, Transformer=${transformer.constructor.name}`,
        async () => {
          const testKey = generateRandomKey();

          const store = new KeyValueStore(storage, serializer, [transformer]);
          await store.initialize();

          await store.set(testKey, testValue);
          const retrievedValue = await store.get(testKey);

          assertEquals(retrievedValue, testValue, "Retrieved value should match original");
        },
      );
    }
  }
}
