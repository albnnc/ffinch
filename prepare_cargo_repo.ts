import { path } from "./deps.ts";
import { prepareLib } from "./prepare_lib.ts";

export interface PrepareCargoRepoOptions {
  name: string;
  cargoRepo: string;
}

export async function prepareCargoRepo({
  name,
  cargoRepo,
}: PrepareCargoRepoOptions) {
  let buildDir = cargoRepo;
  if (buildDir.startsWith("file://")) {
    buildDir = path.fromFileUrl(buildDir);
  }
  if (cargoRepo.startsWith("http://") || cargoRepo.startsWith("https://")) {
    buildDir = await Deno.makeTempDir();
    const [repoUrl, tag] = cargoRepo.split("#");
    await Deno.run({
      cmd: ["git", "clone", repoUrl, buildDir, "--depth", "1"],
    })
      .status()
      .then((v) => (v.success ? undefined : Promise.reject()));
    if (tag) {
      await Deno.run({
        cmd: ["git", "fetch", "origin", "tag", tag, "--no-tags"],
        cwd: buildDir,
      })
        .status()
        .then((v) => (v.success ? undefined : Promise.reject()));
      await Deno.run({
        cmd: ["git", "checkout", tag],
        cwd: buildDir,
      })
        .status()
        .then((v) => (v.success ? undefined : Promise.reject()));
    }
  }

  await Deno.run({
    cmd: ["cargo", "build", "--release"],
    cwd: buildDir,
  })
    .status()
    .then((v) => (v.success ? undefined : Promise.reject()));
  const libDir = path.join(buildDir, "target", "release");
  return prepareLib({ name, libDir });
}
