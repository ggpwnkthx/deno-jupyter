import { MaybeAsync } from "../utils/maybe.ts";

export default class Plugin {
  protected ensure: Promise<void>[] | undefined;
  /**
   * Prepares the plugin for operation.
   */
  async initialize() {
    this.ensure && await Promise.all(this.ensure)
  }

  /**
   * Converts the plugin's state into a JSON string.
   */
  toJSON(): MaybeAsync<string | null> {
    return null
  };

  static fromJSON(json?: unknown) {
    return new this()
  }
}
