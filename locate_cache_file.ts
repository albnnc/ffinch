import { path } from "./deps.ts";
import { locateDenoDir } from "./locate_deno_dir.ts";

export async function locateCacheFile(id: string) {
  const denoDir = await locateDenoDir();
  return path.join(denoDir, "ffinch", id);
}
