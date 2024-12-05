import { TableClient, TableServiceClient } from "npm:@azure/data-tables";
import { ContainerClient, BlobServiceClient } from "npm:@azure/storage-blob";
import { Buffer } from "node:buffer";
import { StorageService } from "../types.ts";

type KeyValueTableEntity = {
  isBlob: boolean;
  data?: Uint8Array;
}

function isErrorWithStatusCode(error: unknown): error is { statusCode: number } {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

export class AzureStorageService implements StorageService {
  private tableServiceClient: TableServiceClient;
  private tableClient: TableClient;
  private partitionKey: string;
  private blobServiceClient: BlobServiceClient;
  private blobContainerClient: ContainerClient;

  private ensure: Promise<void>[];
  private static MAX_TABLE_SIZE = 64 * 1024; // 64 KB

  constructor(connectionString: string, tableName: string, partitionKey: string) {
    this.tableServiceClient = TableServiceClient.fromConnectionString(connectionString);
    this.tableClient = TableClient.fromConnectionString(connectionString, tableName);
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.blobContainerClient = this.blobServiceClient.getContainerClient(tableName);
    this.partitionKey = partitionKey;

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

  async get(key: string): Promise<Uint8Array | null> {
    await Promise.all(this.ensure);

    try {
      const entity = await this.tableClient.getEntity<KeyValueTableEntity>(this.partitionKey, key);

      if (entity.isBlob) {
        const blobClient = this.blobContainerClient
          .getBlobClient(`${ this.partitionKey } / ${ key }`);
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
    await Promise.all(this.ensure);

    if (value.byteLength <= AzureStorageService.MAX_TABLE_SIZE) {
      await this.tableClient.upsertEntity<KeyValueTableEntity>({
        partitionKey: this.partitionKey,
        rowKey: key,
        data: value,
        isBlob: false,
      });
    } else {
      const blobClient = this.blobContainerClient
        .getBlockBlobClient(`${ this.partitionKey } / ${ key }`);
      await blobClient.uploadData(value);
      await this.tableClient.upsertEntity<KeyValueTableEntity>({
        partitionKey: this.partitionKey,
        rowKey: key,
        isBlob: true,
      });
    }
  }

  async delete(key: string): Promise<void> {
    await Promise.all(this.ensure);

    try {
      const entity = await this.tableClient.getEntity<KeyValueTableEntity>(this.partitionKey, key);

      if (entity.isBlob) {
        const blobClient = this.blobContainerClient
          .getBlobClient(`${ this.partitionKey } / ${ key }`);
        await blobClient.deleteIfExists();
      }

      await this.tableClient.deleteEntity(this.partitionKey, key);
    } catch (error) {
      if (isErrorWithStatusCode(error) && error.statusCode !== 404) throw error;
    }
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