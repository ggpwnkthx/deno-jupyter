import Plugin from "../mod.ts";
import { MaybeAsync } from "../../utils/maybe.ts";

export default abstract class SerializerPlugin extends Plugin {
  /**
   * Serializes the provided data into a `Uint8Array`.
   *
   * @param data - The data to serialize.
   */
  abstract serialize(data: unknown): MaybeAsync<Uint8Array>;

  /**
   * Deserializes the given `Uint8Array` back into its original form.
   *
   * @param data - The serialized `Uint8Array` to be deserialized.
   */
  abstract deserialize<T = unknown>(data: Uint8Array): MaybeAsync<T>;
}
