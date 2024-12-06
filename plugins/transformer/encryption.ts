import Plugin, { PluginRegistry } from "../mod.ts";
import TransformerPlugin from "./abstract.ts";

/**
 * EncryptionTransformerPlugin encrypts and decrypts data using AES-GCM.
 *
 * Constructor:
 * - secretKey: String used to derive the encryption key.
 *
 * Methods:
 * - initialize(): Sets up the transformer.
 * - transform(data: Uint8Array): Encrypts the data.
 * - reverse(data: Uint8Array): Decrypts the data back to its original form.
 */
export default class EncryptionTransformerPlugin extends Plugin implements TransformerPlugin {
  private key: Promise<CryptoKey>; // AES-GCM key
  private algorithm: string = "AES-GCM";
  private ivLength: number = 12;

  constructor(config: { secretKey: string }) {
    super(config)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(config.secretKey.padEnd(32, "0").slice(0, 32));
    this.key = crypto.subtle.importKey(
      "raw",
      keyData,
      { name: this.algorithm },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async transform(data: Uint8Array): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv },
      await this.key,
      data
    );

    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);

    return result;
  }

  async reverse(data: Uint8Array): Promise<Uint8Array> {
    const iv = data.slice(0, this.ivLength);
    const encryptedContent = data.slice(this.ivLength);

    const decrypted = await crypto.subtle.decrypt(
      { name: this.algorithm, iv },
      await this.key,
      encryptedContent
    );

    return new Uint8Array(decrypted);
  }
}

PluginRegistry.register(EncryptionTransformerPlugin);