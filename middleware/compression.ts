import { Buffer } from "node:buffer";
import { Middleware } from "../types.ts";

export class CompressionMiddleware implements Middleware {
  private algorithm: "gzip" | "deflate";

  constructor(config: { algorithm?: "gzip" | "deflate" } = {}) {
    this.algorithm = config.algorithm || "gzip";
  }

  async do(data: Uint8Array): Promise<Uint8Array> {
    const compressed = new CompressionStream(this.algorithm);
    const writer = compressed.writable.getWriter();
    writer.write(data);
    writer.close();

    const reader = compressed.readable.getReader();
    const chunks: Uint8Array[] = [];
    let result: ReadableStreamReadResult<Uint8Array>;
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }
    return Uint8Array.from(Buffer.concat(chunks));
  }

  async undo(data: Uint8Array): Promise<Uint8Array> {
    const decompressed = new DecompressionStream(this.algorithm);
    const writer = decompressed.writable.getWriter();
    writer.write(data);
    writer.close();

    const reader = decompressed.readable.getReader();
    const chunks: Uint8Array[] = [];
    let result: ReadableStreamReadResult<Uint8Array>;
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }
    return Uint8Array.from(Buffer.concat(chunks));
  }
}