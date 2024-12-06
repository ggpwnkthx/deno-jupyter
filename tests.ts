import { assertEquals } from "jsr:@std/assert";
import KeyValueStore from "./mod.ts";
import MemoryStoragePlugin from "./plugins/storage/memory.ts";
import PersistentStoragePlugin from "./plugins/storage/persistent.ts";
import JSONSerializerPlugin from "./plugins/serializer/json.ts";
import DevalueSerializerPlugin from "./plugins/serializer/devalue.ts";
import CompressionTransformerPlugin from "./plugins/transformer/compression.ts";
import EncryptionTransformerPlugin from "./plugins/transformer/encryption.ts";
import { SerializerPlugin, StoragePlugin, TransformerPlugin } from "./types.ts";

// Define all plugins
const storagePlugins = [
  new MemoryStoragePlugin(),
  new PersistentStoragePlugin(`./test-cache.json`),
];

const serializerPlugins = [
  new JSONSerializerPlugin(),
  new DevalueSerializerPlugin(),
];

const transformerPlugins = [
  new CompressionTransformerPlugin(),
  new EncryptionTransformerPlugin("my-secret-key"),
];

// Function to generate a random key
function generateRandomKey(): string {
  return crypto.randomUUID();
}

// Test value with diverse data types
const testValue = {
  string: "hello",
  number: 42,
  boolean: true,
  array: [1, 2, 3],
  object: { nested: "value" },
  nullValue: null,
};

const test = async (
  storage: StoragePlugin, 
  serializer: SerializerPlugin, 
  transformers: TransformerPlugin[] = []
) => {
  const testKey1 = generateRandomKey();
  const testKey2 = generateRandomKey();

  const store = new KeyValueStore(storage, serializer, transformers);
  await store.initialize();

  await store.set(testKey1, testValue);
  await store.set(testKey2, testValue);

  const keys = await store.list();

  assertEquals(keys.length, 2, "The list should contain exactly two keys.");
  assertEquals(keys.includes(testKey1), true, "The list should contain testKey1.");
  assertEquals(keys.includes(testKey2), true, "The list should contain testKey2.");

  await store.delete(testKey1);

  const keysAfterDelete = await store.list();
  assertEquals(keysAfterDelete.length, 1, "The list should contain exactly one key after delete.");
  assertEquals(keysAfterDelete.includes(testKey2), true, "The list should still contain testKey2.");

  await store.delete(testKey2);
}

// Generate tests dynamically
for (const storage of storagePlugins) {
  for (const serializer of serializerPlugins) {
    // Test the `list` method without transformers
    Deno.test(
      `Storage=${storage.constructor.name}, Serializer=${serializer.constructor.name}, No Transformers - List`,
      async () => await test(storage, serializer),
    );

    // Test the `list` method with transformers
    for (const transformer of transformerPlugins) {
      Deno.test(
        `Storage=${storage.constructor.name}, Serializer=${serializer.constructor.name}, Transformer=${transformer.constructor.name} - List`,
        async () => await test(storage, serializer, [transformer]),
      );
    }
  }
}
