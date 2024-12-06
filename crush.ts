import KeyValueStore, { KeyValueConfig } from "./mod.ts";
import DevalueSerializerPlugin from "./plugins/serializer/devalue.ts";
import StoragePlugin from "./plugins/storage/abstract.ts";

/**
 * CRUSH-based storage plugin.
 * Distributes data across multiple storage nodes using the CRUSH algorithm.
 */
class CRUSHKeyValueStore extends KeyValueStore {
  constructor(storage: StoragePlugin) {
    super(storage, new DevalueSerializerPlugin(), [])
  }

  override async get<T = unknown>(key: string): Promise<T | null> {
    return (await this.getNode(await this.getNodeId(key)))?.get<T>(key) ?? null
  }

  override async set<T = unknown>(key: string, value: T) {
    (await this.getNode(await this.getNodeId(key)))?.set<T>(key, value)
  }

  override async delete(key: string) {
    (await this.getNode(await this.getNodeId(key)))?.delete(key)
  }

  /**
   * CRUSH-like mapping function to select a node for a given key.
   * @param key - The key to map to a node.
   * @returns The selected node's ID.
   */
  protected async getNodeId(key: string): Promise<string> {
    const nodes = await super.list();
    if (nodes.length === 0) throw new Error("No available nodes.");
    const hash = [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return nodes[hash % nodes.length];
  }

  protected async getNode(id: string) {
    const config = await super.get<KeyValueConfig>(id)
    if (config) return KeyValueStore.fromJSON(config)
  }

}

export default CRUSHKeyValueStore;
