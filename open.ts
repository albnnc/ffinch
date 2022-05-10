import { cacheLib, CacheLibOptions } from "./cache_lib.ts";

export async function open<T extends Deno.ForeignLibraryInterface>(
  options: CacheLibOptions,
  symbols: T
) {
  const libFile = await cacheLib(options);
  return Deno.dlopen(libFile, symbols);
}
