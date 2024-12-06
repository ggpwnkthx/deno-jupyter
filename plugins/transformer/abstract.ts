import Plugin from "../mod.ts";
import { MaybeAsync } from "../../utils/maybe.ts";

export default abstract class TransformerPlugin extends Plugin {
  /**
   * Applies a forward transformation to the provided data.
   *
   * @param data - The data to transform.
   */
  abstract transform(data: Uint8Array): MaybeAsync<Uint8Array>;

  /**
   * Reverses the transformation applied by `transform`.
   *
   * @param data - The transformed data.
   */
  abstract reverse(data: Uint8Array): MaybeAsync<Uint8Array>;
}
