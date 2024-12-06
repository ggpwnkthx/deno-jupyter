import Plugin from "../mod.ts";
import TransformerPlugin from "./abstract.ts";
import { Buffer } from "node:buffer";

/**
 * CompressionTransformerPlugin provides data compression and decompression
 * using built-in CompressionStream and DecompressionStream APIs.
 *
 * Constructor:
 * - config: Optional configuration for the compression algorithm (gzip/deflate).
 *
 * Methods:
 * - initialize(): Sets up the transformer (no-op for compression).
 * - transform(data: Uint8Array): Compresses the input data.
 * - reverse(data: Uint8Array): Decompresses the input data.
 */
export default class CompressionTransformerPlugin extends Plugin implements TransformerPlugin {
  private algorithm: "gzip" | "deflate";

  constructor(config: { algorithm?: "gzip" | "deflate" } = {}) {
    super()
    this.algorithm = config.algorithm || "gzip";
  }

  async transform(data: Uint8Array): Promise<Uint8Array> {
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

  async reverse(data: Uint8Array): Promise<Uint8Array> {
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