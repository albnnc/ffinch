export type PointerIoFn = (
  input: Deno.UnsafePointer | Deno.TypedArray | null
) => Deno.UnsafePointer | Promise<Deno.UnsafePointer>;

export type JsonIoFn = (
  input: Record<string, unknown>
) => Promise<Record<string, unknown>>;

export function withJsonIo(pointerIoFn: PointerIoFn): JsonIoFn {
  const encoder = new TextEncoder();
  const jsonIoFn: JsonIoFn = async (jsonInput) => {
    const pointerInput = encoder.encode(JSON.stringify(jsonInput));
    const pointerOutput = await pointerIoFn(pointerInput);
    if (!pointerOutput.value) {
      throw new Error("Got null pointer");
    }
    const jsonOutput = JSON.parse(
      new Deno.UnsafePointerView(pointerOutput).getCString()
    );
    return jsonOutput;
  };
  return jsonIoFn;
}
