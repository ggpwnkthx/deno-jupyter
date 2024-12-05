import { SerializerPlugin } from "../../types.ts";

export class JSONSerializerPlugin implements SerializerPlugin {
  initialize(): void {
    console.log("JSONSerializerPlugin initialized.");
  }

  serialize(data: unknown): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(data));
  }

  deserialize(data: Uint8Array): unknown {
    return JSON.parse(new TextDecoder().decode(data));
  }
}
