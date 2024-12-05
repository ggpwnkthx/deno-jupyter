import { MiddlewarePipeline } from "./middleware/mod.ts";
import { Middleware, Serializer, StorageService } from "./types.ts";
import { DefaultSerializer } from "./serializer.ts";

export class KeyValueStore {
  private storageService: StorageService;
  private serializer: Serializer;
  private middlewarePipeline: MiddlewarePipeline;

  constructor(
    storageService: StorageService,
    serializer?: Serializer,
    middlewares?: Middleware[],
  ) {
    this.storageService = storageService;
    this.serializer = serializer ?? new DefaultSerializer()
    this.middlewarePipeline = new MiddlewarePipeline();
    middlewares?.forEach((m) => this.middlewarePipeline.addMiddleware(m))
  }

  async get(key: string): Promise<unknown | null> {
    const storedValue = await this.storageService.get(key);
    if (!storedValue) return null;
    return await this.serializer.serialize(
      await this.middlewarePipeline.undo(storedValue)
    );
  }

  // deno-lint-ignore no-explicit-any
  async set(key: string, value: any): Promise<void> {
    await this.storageService.set(
      key, 
      await this.middlewarePipeline.do(
        await this.serializer.deserialize(value)
      )
    );
  }

  async delete(key: string): Promise<void> {
    await this.storageService.delete(key);
  }
}
