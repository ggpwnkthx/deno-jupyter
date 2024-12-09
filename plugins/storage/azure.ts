import Plugin, { PluginRegistry } from "../mod.ts";
import StoragePlugin from "./abstract.ts";
import { TableClient, TableServiceClient } from "npm:@azure/data-tables";
import { ContainerClient, BlobServiceClient } from "npm:@azure/storage-blob";
import { Buffer } from "node:buffer";

type KeyValueTableEntity = {
  isBlob: boolean;
  data?: Uint8Array;
}

function isErrorWithStatusCode(error: unknown): error is { statusCode: number } {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

/**
 * AzureStoragePlugin integrates Azure Table Storage and Blob Storage to provide
 * a scalable storage backend for key-value data. It manages small data items
 * in Azure Table Storage and larger ones in Blob Storage.
 *
 * Constructor:
 * - connectionString: Azure connection string for authentication.
 * - tableName: Name of the Azure Table for small data storage.
 * - partitionKey: Key used to partition data in the table.
 *
 * Methods:
 * - initialize(): Ensures table and blob container existence.
 * - get(key: string): Retrieves data from table or blob.
 * - set(key: string, value: Uint8Array): Stores data in table or blob.
 * - delete(key: string): Removes data from table and blob.
 */
export default class AzureStoragePlugin extends Plugin implements StoragePlugin {
  private tableServiceClient: TableServiceClient;
  private tableClient: TableClient;
  private defaultPartitionKey: string;
  private blobServiceClient: BlobServiceClient;
  private blobContainerClient: ContainerClient;
  private static MAX_TABLE_SIZE = 64 * 1024; // 64 KB

  constructor(config: { 
    connectionString: string, 
    tableName: string, 
    partitionKey?: string
  }) {
    super(config)
    this.tableServiceClient = TableServiceClient.fromConnectionString(config.connectionString);
    this.tableClient = TableClient.fromConnectionString(config.connectionString, config.tableName);
    this.blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
    this.blobContainerClient = this.blobServiceClient.getContainerClient(config.tableName);
    this.defaultPartitionKey = config.partitionKey ?? `default`;

    this.ensure = [this.ensureTableExists(), this.ensureContainerExists()];
  }

  private async ensureTableExists(): Promise<void> {
    const tables = this.tableServiceClient.listTables();
    for await (const table of tables) {
      if (table.name === this.tableClient.tableName) return;
    }
    await this.tableServiceClient.createTable(this.tableClient.tableName);
  }

  private async ensureContainerExists(): Promise<void> {
    const exists = await this.blobContainerClient.exists();
    if (!exists) {
      await this.blobContainerClient.create();
    }
  }

  /**
   * Azure Table Row Keys and Blob paths may not contain the following characters:
   *  Forward slash `/`
   *  Back slach `\`
   *  Number sign `#`
   *  Question mark `?` 
   *  Horizontal tab `\t`
   *  Linefeed `\n`
   *  Carriage return `\r`
   *  Control characters from `U+0000` to `U+001F`
   *  Control characters from `U+007F` to `U+009F`
   * 
   * To accomodate this, we can just Base64 encode the key.
   * 
   * @param key 
   * @returns 
   */
  private encodeKey(key: string): string {
    return btoa(key)
  }

  private decodeKey(key: string): string {
    return atob(key)
  }

  async get(key: string): Promise<Uint8Array | null> {
    const partitionKey = this.defaultPartitionKey
    const rowKey = this.encodeKey(key)
    try {
      const entity = await this.tableClient.getEntity<KeyValueTableEntity>(partitionKey, rowKey);

      if (entity.isBlob) {
        const blobClient = this.blobContainerClient
          .getBlobClient(`${partitionKey} / ${rowKey}`);
        const downloadResponse = await blobClient.download();
        const blobData = await this.streamToBuffer(downloadResponse.readableStreamBody!);
        return blobData;
      }

      if (entity.data) {
        return entity.data;
      }

      return null;
    } catch (error) {
      if (isErrorWithStatusCode(error) && error.statusCode === 404) return null;
      throw error;
    }
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    const partitionKey = this.defaultPartitionKey
    const rowKey = this.encodeKey(key)
    if (value.byteLength <= AzureStoragePlugin.MAX_TABLE_SIZE) {
      await this.tableClient.upsertEntity<KeyValueTableEntity>({
        partitionKey,
        rowKey,
        data: value,
        isBlob: false,
      });
    } else {
      const blobClient = this.blobContainerClient
        .getBlockBlobClient(`${this.defaultPartitionKey} / ${rowKey}`);
      await blobClient.uploadData(value);
      await this.tableClient.upsertEntity<KeyValueTableEntity>({
        partitionKey,
        rowKey,
        isBlob: true,
      });
    }
  }

  async delete(key: string): Promise<void> {
    const partitionKey = this.defaultPartitionKey
    const rowKey = this.encodeKey(key)
    try {
      const entity = await this.tableClient.getEntity<KeyValueTableEntity>(partitionKey, rowKey);

      if (entity.isBlob) {
        const blobClient = this.blobContainerClient
          .getBlobClient(`${this.defaultPartitionKey} / ${rowKey}`);
        await blobClient.deleteIfExists();
      }

      await this.tableClient.deleteEntity(partitionKey, rowKey);
    } catch (error) {
      if (isErrorWithStatusCode(error) && error.statusCode !== 404) throw error;
    }
  }

  async list(): Promise<string[]> {
    const keys: string[] = [];
    for await (const entity of this.tableClient.listEntities<KeyValueTableEntity>()) {
      entity.rowKey && keys.push(this.decodeKey(entity.rowKey));
    }
    return keys;
  }

  private streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      readableStream.on("data", (data) => {
        const content: Buffer = data instanceof Buffer ? data : Buffer.from(data);
        chunks.push(content);
      });
      readableStream.on("end", () => {
        resolve(Uint8Array.from(Buffer.concat(chunks)));
      });
      readableStream.on("error", reject);
    });
  }
}

PluginRegistry.register(AzureStoragePlugin);