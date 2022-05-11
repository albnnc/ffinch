import { path, streams } from "./deps.ts";

export interface PrepareLibOptions {
  name: string;
  libDir: string;
}

export async function prepareLib({ name, libDir }: PrepareLibOptions) {
  const dirUrl = libDir.startsWith("file://")
    ? libDir
    : path.toFileUrl(libDir).toString();
  const libUrl = new URL(
    `./lib${name}` +
      {
        windows: ".dll",
        darwin: ".dylib",
        linux: ".so",
      }[Deno.build.os],
    dirUrl.endsWith("/") ? dirUrl : dirUrl + "/"
  ).toString();
  const resp = await fetch(libUrl);
  const reader = streams.readerFromStreamReader(resp.body!.getReader());
  return reader;
}
