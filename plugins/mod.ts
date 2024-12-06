import { MaybeAsync } from "../utils/maybe.ts";

export default class Plugin {
  private config: unknown | undefined;
  protected ensure: Promise<void>[] | undefined;

  constructor(config?: unknown) {
    this.config = config;
  }

  /**
   * Prepares the plugin for operation.
   */
  async initialize() {
    this.ensure && await Promise.all(this.ensure);
  }

  /**
   * Converts the plugin's state into a JSON string.
   */
  toJSON(): MaybeAsync<unknown> {
    return this.config ? JSON.stringify(this.config) : null;
  };

  static fromJSON(json?: string | object | null) {
    if (json) return new this(typeof json === "string" ? JSON.parse(json) : json);
    return new this();
  }
}
