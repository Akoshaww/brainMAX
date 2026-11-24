import type { SectionId } from "@/config/sections";
import { LETTERS, type Letter } from "@/lib/letters";
import type { Question } from "@/lib/types";

/** Строка теста: [текст, варианты, буква правильного ответа из ключа]. */
export type Row = [text: string, options: string[], correct: Letter];

export type Meta = { part?: string; instruction?: string };

/** Превращает строки с буквами ключа в вопросы. Сквозные id назначаются позже, в data/questions.ts. */
export function rows(section: SectionId, list: Row[], meta: Meta = {}): Question[] {
  return list.map(([text, options, correct]) => {
    const correctIndex = LETTERS.indexOf(correct);
    if (options.length < 2 || options.length > LETTERS.length || correctIndex < 0 || correctIndex >= options.length) {
      throw new Error(`Некорректный вопрос: ${text.slice(0, 50)}`);
    }
    return { id: 0, section, text, options, correctIndex, ...meta };
  });
}
