export type StorageService = {
  get(key: string): Promise<Uint8Array | null> | Uint8Array | null;
  set(key: string, value: Uint8Array): Promise<void> | void;
  delete(key: string): Promise<void> | void;
};

export type Middleware = {
  do(data: Uint8Array): Promise<Uint8Array>;
  undo(data: Uint8Array): Promise<Uint8Array>;
};

export type Serializer = {
  serialize(data: unknown): Promise<Uint8Array>;
  // deno-lint-ignore no-explicit-any
  deserialize(data: Uint8Array): Promise<any>;
}