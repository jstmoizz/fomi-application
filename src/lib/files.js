// Readable download names: "fomi-redhead-portrait-2.jpg" instead of the storage key.
export function fileName(label, index, src) {
  const ext = src.split("?")[0].split(".").pop() || "jpg";
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 5)
    .join("-");
  return `fomi-${slug || "export"}${index == null ? "" : `-${index + 1}`}.${ext}`;
}

/** Triggers browser downloads one after another; browsers drop simultaneous ones. */
export async function downloadAll(files) {
  for (const { href, name } of files) {
    const a = Object.assign(document.createElement("a"), { href, download: name });
    a.click();
    await new Promise((r) => setTimeout(r, 250));
  }
}
