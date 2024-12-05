export function encode(key: Deno.KvKey): string {
  return btoa(JSON.stringify(key))
}

export function decode(key: string): Deno.KvKey {
  return JSON.parse(atob(key))
}
