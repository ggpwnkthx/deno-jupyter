import { Middleware } from "../types.ts";

export class DefaultEncryptionMiddleware implements Middleware {
  private key: Promise<CryptoKey>; // AES-GCM key
  private algorithm: string = "AES-GCM";
  private ivLength: number = 12;

  constructor(secretKey: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey.padEnd(32, "0").slice(0, 32));
    this.key = crypto.subtle.importKey(
      "raw",
      keyData,
      { name: this.algorithm },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async do(data: Uint8Array): Promise<Uint8Array> {
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

  async undo(data: Uint8Array): Promise<Uint8Array> {
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