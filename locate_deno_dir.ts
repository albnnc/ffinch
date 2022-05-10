let denoDir: string | undefined;

export async function locateDenoDir(): Promise<string> {
  if (denoDir) {
    return denoDir;
  }
  const process = await Deno.run({
    cmd: ["deno", "info", "--json"],
    stdout: "piped",
  });
  const [raw] = await Promise.all([process.output(), process.status()]);
  const data = JSON.parse(new TextDecoder().decode(raw));
  return (denoDir = data.denoDir);
}
