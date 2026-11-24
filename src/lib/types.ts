import type { Lang } from "@/config/languages";
import type { SectionId } from "@/config/sections";

export type Question = {
  id: number;
  section: SectionId;
  /** Подраздел внутри раздела, например «Дополнение предложений» (необязательно) */
  part?: string;
  /** Инструкция к заданию — показывается над вопросом (необязательно) */
  instruction?: string;
  /** Текст вопроса. **слово** — выделяется жирным с подчёркиванием. \n — перенос строки */
  text: string;
  /** От 2 до 5 вариантов ответа (в ОРТ обычно 4, в части заданий по математике — 5). Тоже поддерживают **выделение** */
  options: string[];
  /** Индекс правильного ответа */
  correctIndex: number;
};

export type Session = {
  name: string;
  /** Номер в формате E.164, например +996555123456 */
  phone: string;
  /** Язык теста */
  lang: Lang;
  /** questionId -> индекс выбранного варианта */
  answers: Record<number, number>;
  /** Индекс текущего вопроса */
  current: number;
  finished: boolean;
  startedAt: number;
  finishedAt?: number;
};

export type SectionResult = {
  id: SectionId;
  title: string;
  total: number;
  correct: number;
  answered: number;
  percent: number;
};

export type TestResult = {
  total: number;
  correct: number;
  wrong: number;
  answered: number;
  percent: number;
  sections: SectionResult[];
};
