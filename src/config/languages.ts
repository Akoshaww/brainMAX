export type Lang = "ky" | "ru";

export const DEFAULT_LANG: Lang = "ky";

export const languages: { id: Lang; label: string; available: boolean }[] = [
  { id: "ky", label: "Кыргызча", available: true },
  { id: "ru", label: "Русский", available: true },
];
