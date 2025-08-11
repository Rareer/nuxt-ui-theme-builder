// Color-related utilities

export function normalizeColorName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}
