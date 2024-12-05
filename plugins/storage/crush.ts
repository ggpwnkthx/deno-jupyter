import { StoragePlugin } from "../../types.ts";
import { resolveMaybeAsync } from "../../utils.ts";

/**
 * CRUSH-based storage plugin.
 * Distributes data across multiple storage nodes using the CRUSH algorithm.
 */
class CRUSHStoragePlugin implements StoragePlugin {
  private nodes: Map<string, StoragePlugin>; // Mapping of node IDs to storage plugins
  private availableNodes: Set<string>;      // Set of currently available node IDs

  constructor() {
    this.nodes = new Map();
    this.availableNodes = new Set();
  }

  /**
   * Adds multiple storage nodes to the plugin and initializes them.
   * @param newNodes - An array of tuples containing node ID and StoragePlugin instance.
   */
  async addNodes(newNodes: [string, StoragePlugin][]): Promise<void> {
    for (const [nodeId, plugin] of newNodes) {
      if (!this.nodes.has(nodeId)) {
        await plugin.initialize();
        this.nodes.set(nodeId, plugin);
        this.availableNodes.add(nodeId);
      }
    }
    console.debug(`Added and initialized ${newNodes.length} node(s).`);
  }

  /**
   * Removes a storage node from the plugin.
   * @param nodeId - Unique identifier for the node.
   */
  removeNode(nodeId: string): void {
    this.availableNodes.delete(nodeId);
    this.nodes.delete(nodeId);
  }

  /**
   * CRUSH-like mapping function to select a node for a given key.
   * @param key - The key to map to a node.
   * @returns The selected node's ID.
   */
  private selectNode(key: Deno.KvKey): string {
    const nodeArray = Array.from(this.availableNodes);
    const hash = [...key.map(part => part.toString()).join(":")].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return nodeArray[hash % nodeArray.length];
  }

  /**
   * Initializes the CRUSH plugin by setting up nodes.
   * @param initialNodes - Optional initial set of nodes to add during initialization.
   */
  async initialize(initialNodes: [string, StoragePlugin][] = []): Promise<void> {
    if (initialNodes.length > 0) {
      await this.addNodes(initialNodes);
    }
    console.debug("CRUSHStoragePlugin initialized.");
  }

  async get(key: Deno.KvKey): Promise<Uint8Array | null> {
    if (this.availableNodes.size === 0) {
      throw new Error("No available nodes.");
    }

    const nodeId = this.selectNode(key);
    const node = this.nodes.get(nodeId);
    return await resolveMaybeAsync(node?.get(key)) ?? null;
  }

  async set(key: Deno.KvKey, value: Uint8Array): Promise<void> {
    if (this.availableNodes.size === 0) {
      throw new Error("No available nodes.");
    }

    const nodeId = this.selectNode(key);
    const node = this.nodes.get(nodeId);
    if (node) {
      await resolveMaybeAsync(node.set(key, value));
    }
  }

  async delete(key: Deno.KvKey): Promise<void> {
    if (this.availableNodes.size === 0) {
      throw new Error("No available nodes.");
    }

    const nodeId = this.selectNode(key);
    const node = this.nodes.get(nodeId);
    if (node) {
      await resolveMaybeAsync(node.delete(key));
    }
  }
}

export default CRUSHStoragePlugin;
