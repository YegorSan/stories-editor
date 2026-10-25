export function uid(prefix = "el"): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
