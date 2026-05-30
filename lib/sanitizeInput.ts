export function sanitizeInstruction(input: string) {
  return input
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^a-zA-Z0-9 ,.:;\/\-\(\)]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 200);
}
