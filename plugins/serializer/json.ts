import { SerializerPlugin } from "../../types.ts";

/**
 * JSONSerializerPlugin implements a serializer plugin that handles JSON data.
 * It encodes data into JSON format as Uint8Array and decodes it back to the original object.
 *
 * Methods:
 * - initialize(): Sets up the plugin (no-op for JSON).
 * - serialize(data: unknown): Converts data into a JSON string encoded as Uint8Array.
 * - deserialize(data: Uint8Array): Decodes JSON string back to the original data.
 */
export default class JSONSerializerPlugin implements SerializerPlugin {
  initialize(): void {
    console.log("JSONSerializerPlugin initialized.");
  }

  serialize(data: unknown): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(data));
  }

  deserialize(data: Uint8Array): unknown {
    return JSON.parse(new TextDecoder().decode(data));
  }
}
