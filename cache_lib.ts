import { path, streams } from "./deps.ts";
import { identify } from "./identify.ts";
import { locateCacheFile } from "./locate_cache_file.ts";

export interface CacheLibOptions {
  name: string;
  version: string;
  lib: string;
  force?: boolean;
}

export async function cacheLib({ name, version, lib, force }: CacheLibOptions) {
  const id = await identify({ name, version });
  const cacheFile = await locateCacheFile(id);
  const cacheFileExists = await Deno.lstat(cacheFile)
    .then(() => true)
    .catch(() => false);
  if (cacheFileExists && !force) {
    return cacheFile;
  }
  const dirUrl = lib.startsWith("file://") ? lib : path.toFileUrl(lib);
  const libUrl = new URL(
    `./lib${name}` +
      {
        windows: ".dll",
        darwin: ".dylib",
        linux: ".so",
      }[Deno.build.os],
    dirUrl
  ).toString();
  const resp = await fetch(libUrl);
  if (cacheFileExists) {
    await Deno.remove(cacheFile);
  }
  const cacheDir = path.dirname(cacheFile);
  await Deno.mkdir(cacheDir, { recursive: true }).catch(() => undefined);
  const file = await Deno.create(cacheFile);
  const reader = streams.readerFromStreamReader(resp.body!.getReader());
  await streams.copy(reader, file);
  return cacheFile;
}
