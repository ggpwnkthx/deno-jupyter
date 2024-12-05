import { Plugin } from "../types.ts";

/**
 * PluginRegistry provides a simple registry to manage and access plugins by name.
 * It allows registering new plugins and retrieving them as needed.
 *
 * Methods:
 * - register(pluginName: string, plugin: Plugin): Registers a plugin with a unique name.
 * - get<T extends Plugin>(pluginName: string): Retrieves a plugin by name.
 */
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();

  register(pluginName: string, plugin: Plugin): void {
    this.plugins.set(pluginName, plugin);
  }

  get<T extends Plugin>(pluginName: string): T | undefined {
    return this.plugins.get(pluginName) as T;
  }
}

export default new PluginRegistry();
