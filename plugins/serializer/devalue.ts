import { SerializerPlugin } from "../../types.ts";
import { uneval } from "npm:devalue"

/**
 * The DevalueSerializerPlugin uses `devalue` to serialize and deserialize
 * arbitrary JavaScript data. It transforms data into a JavaScript expression
 * (as a string) that, when evaluated, reproduces the original data structure.
 *
 * This plugin:
 * - Converts any data into a stringified, evaluable JavaScript expression.
 * - Encodes the string into a `Uint8Array` for serialization.
 * - Decodes and `eval`s the resulting string back into the original data.
 *
 * Note: `eval` is used during deserialization, so ensure that you trust the
 * serialized source.
 */
export default class DevalueSerializerPlugin implements SerializerPlugin {
  initialize(): void {
    console.log("DevalueSerializerPlugin initialized.");
  }

  serialize(data: unknown) {
    return new TextEncoder().encode(uneval(data));
  }

  deserialize(data: Uint8Array) {
    return eval(`(${new TextDecoder().decode(data)})`);
  }
}
