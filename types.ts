export type MaybeAsync<T> = T | Promise<T>; 

export type Plugin = {
  initialize(): MaybeAsync<void>;
};

export type StoragePlugin = Plugin & {
  get(key: string): MaybeAsync<Uint8Array | null>;
  set(key: string, value: Uint8Array): MaybeAsync<void>;
  delete(key: string): MaybeAsync<void>;
};

export type SerializerPlugin = Plugin & {
  serialize(data: unknown): MaybeAsync<Uint8Array>;
  deserialize(data: Uint8Array): MaybeAsync<unknown>;
};

export type TransformerPlugin = Plugin & {
  transform(data: Uint8Array): MaybeAsync<Uint8Array>;
  reverse(data: Uint8Array): MaybeAsync<Uint8Array>;
};
