export interface IdentifyOptions {
  name: string;
  version: string;
}

export async function identify({ name, version }: IdentifyOptions) {
  const token = [Deno.build.arch, Deno.build.os, name, version].join("_");
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );
  const id = new Uint8Array(bytes).reduce(
    (p, v) => p + v.toString(16).padStart(2, "0"),
    ""
  );
  return id;
}
