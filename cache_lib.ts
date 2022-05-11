import { path, streams } from "./deps.ts";
import { identify } from "./identify.ts";
import { locateCacheFile } from "./locate_cache_file.ts";
import { prepareCargoRepo } from "./prepare_cargo_repo.ts";
import { prepareLib } from "./prepare_lib.ts";

export interface CacheLibOptions {
  name: string;
  version: string;
  libDir?: string;
  cargoRepo?: string;
  reload?: boolean;
}

export async function cacheLib({
  name,
  version,
  libDir,
  cargoRepo,
  reload,
}: CacheLibOptions) {
  const id = await identify({ name, version });
  const cacheFile = await locateCacheFile(id);
  const cacheFileExists = await Deno.lstat(cacheFile)
    .then(() => true)
    .catch(() => false);
  if (cacheFileExists && !reload) {
    return cacheFile;
  }
  const reader = libDir
    ? await prepareLib({ name, libDir })
    : cargoRepo
    ? await prepareCargoRepo({ name, cargoRepo })
    : undefined;
  if (!reader) {
    throw new Error("Either libDir or cargoRepo option must be used");
  }
  if (cacheFileExists) {
    await Deno.remove(cacheFile);
  }
  const cacheDir = path.dirname(cacheFile);
  await Deno.mkdir(cacheDir, { recursive: true }).catch(() => undefined);
  const file = await Deno.create(cacheFile);
  await streams.copy(reader, file);
  return cacheFile;
}
