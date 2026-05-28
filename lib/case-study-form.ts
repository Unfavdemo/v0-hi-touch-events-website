/** Parse admin textarea: blank line separates paragraphs. */
export function bodyParagraphsFromText(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function bodyTextFromParagraphs(paragraphs: string[]): string {
  return paragraphs.join("\n\n")
}

export function parseCaseStudyBody(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === "string")
}

export function slugifyCaseStudy(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
