import { Serializer } from "./types.ts";

export class DefaultSerializer implements Serializer {
  async serialize(data: unknown): Promise<Uint8Array> {
    const jsonString = JSON.stringify(data);
    return new TextEncoder().encode(jsonString);
  }

  // deno-lint-ignore no-explicit-any
  async deserialize(data: Uint8Array): Promise<any> {
    const jsonString = new TextDecoder().decode(data);
    return JSON.parse(jsonString);
  }
}