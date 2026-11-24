export type SectionId = "math" | "analogy" | "grammar";

/** Порядок в массиве = порядок разделов в тесте. */
export const sections: { id: SectionId; title: string }[] = [
  { id: "math", title: "Математика" },
  { id: "analogy", title: "Аналогии" },
  { id: "grammar", title: "Грамматика" },
];

export function sectionTitle(id: SectionId): string {
  return sections.find((s) => s.id === id)?.title ?? id;
}
