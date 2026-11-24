/** Буквы вариантов ответа (в ОРТ бывает от 4 до 5 вариантов). */
export const LETTERS = ["А", "Б", "В", "Г", "Д"] as const;
export type Letter = (typeof LETTERS)[number];
