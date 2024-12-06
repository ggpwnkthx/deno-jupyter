import { MaybeAsync } from "../utils/maybe.ts";

export type PluginConfig = {
  type: string; // Unique identifier for each plugin type
  // deno-lint-ignore no-explicit-any
  config: any | undefined; // Plugin-specific configuration
}

export default class Plugin {
  private config: PluginConfig["config"];
  protected ensure: Promise<void>[] | undefined;

  constructor(config?: PluginConfig["config"]) {
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
  toJSON(): MaybeAsync<PluginConfig> {
    return {
      type: this.constructor.name,
      config: this.config
    };
  };

  static fromJSON(json?: string | PluginConfig) {
    if (json) return new this(
      typeof json === "string" ?
        PluginRegistry.reinstantiate(JSON.parse(json) as PluginConfig) :
        PluginRegistry.reinstantiate(json)
    );
    return new this();
  }
}

type PluginConstructor<T = Plugin> = new (config?: PluginConfig["config"]) => T;

export class PluginRegistry {
  static registry = new Map<string, PluginConstructor>();

  static register(constructor: PluginConstructor): void {
    this.registry.set(constructor.name, constructor);
  }

  static reinstantiate<T = Plugin>(config: PluginConfig): T {
    const Constructor = this.registry.get(config.type) as PluginConstructor<T>;
    if (!Constructor) {
      throw new Error(`Plugin type "${config.type}" is not registered.`);
    }
    return new Constructor(config.config);
  }
}
