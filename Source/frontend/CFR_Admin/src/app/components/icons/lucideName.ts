/** PascalCase Lucide icon name → camelCase AppIconName key. */
export function lucideNameToKey(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
