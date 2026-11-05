/** Stored IDs are untrusted; labels and links always come from the current catalog. */
export function parseCollection(raw: string | null, allowed: ReadonlySet<string>): string[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new TypeError("Collection must be an array");
  return [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))];
}
