export type Question = {
  id: number;
  /** Подпись раздела над вопросом (необязательно) */
  section?: string;
  /** Текст вопроса. **слово** — выделяется жирным с подчёркиванием. \n — перенос строки */
  text: string;
  /** Ровно 4 варианта ответа (тоже поддерживают **выделение**) */
  options: [string, string, string, string];
  /** Индекс правильного ответа (0–3) */
  correctIndex: 0 | 1 | 2 | 3;
};

export type Session = {
  name: string;
  /** Номер в формате E.164, например +996555123456 */
  phone: string;
  /** questionId -> индекс выбранного варианта */
  answers: Record<number, number>;
  /** Индекс текущего вопроса */
  current: number;
  finished: boolean;
  startedAt: number;
  finishedAt?: number;
};

export type TestResult = {
  total: number;
  correct: number;
  wrong: number;
  percent: number;
};