import type { Lang } from "@/config/languages";
import type { Question } from "@/lib/types";
import { analogies as kyAnalogies } from "./ky/analogies";
import { grammar as kyGrammar } from "./ky/grammar";
import { math as kyMath } from "./ky/math";
import { analogies as ruAnalogies } from "./ru/analogies";
import { grammar as ruGrammar } from "./ru/grammar";
import { math as ruMath } from "./ru/math";

// Порядок теста: математика → аналогии → грамматика.
// Сквозные id (1…N) назначаются автоматически по порядку, поэтому в файлах разделов id не важны.
function build(list: Question[]): Question[] {
  return list.map((q, i) => ({ ...q, id: i + 1 }));
}

const banks: Record<Lang, Question[]> = {
  ky: build([...kyMath, ...kyAnalogies, ...kyGrammar]),
  ru: build([...ruMath, ...ruAnalogies, ...ruGrammar]),
};

// Позже эта функция заменится запросом к API/БД — остальной код работает только через неё.
export function getQuestions(lang: Lang): Question[] {
  return banks[lang];
}
