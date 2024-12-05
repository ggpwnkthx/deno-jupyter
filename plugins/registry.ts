import { Plugin } from "../types.ts";

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
