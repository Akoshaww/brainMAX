import { sections } from "@/config/sections";
import type { Question, SectionResult, TestResult } from "@/lib/types";

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export function calculateResult(answers: Record<number, number>, questions: Question[]): TestResult {
  const isCorrect = (q: Question) => answers[q.id] === q.correctIndex;
  const isAnswered = (q: Question) => answers[q.id] !== undefined;

  const total = questions.length;
  const correct = questions.filter(isCorrect).length;

  const sectionResults: SectionResult[] = sections
    .map((sec) => {
      const qs = questions.filter((q) => q.section === sec.id);
      const c = qs.filter(isCorrect).length;
      return {
        id: sec.id,
        title: sec.title,
        total: qs.length,
        correct: c,
        answered: qs.filter(isAnswered).length,
        percent: pct(c, qs.length),
      };
    })
    .filter((s) => s.total > 0);

  return {
    total,
    correct,
    wrong: total - correct,
    answered: questions.filter(isAnswered).length,
    percent: pct(correct, total),
    sections: sectionResults,
  };
}

export function getGrade(percent: number): { title: string; note: string } {
  if (percent >= 90) return { title: "Отлично", note: "Почти безупречный результат." };
  if (percent >= 70) return { title: "Хорошо", note: "Крепкая база — осталось отшлифовать детали." };
  if (percent >= 50) return { title: "Удовлетворительно", note: "Есть над чем поработать — смотрите разделы ниже." };
  return { title: "Нужно подтянуть", note: "Не страшно: посмотрите, какие разделы просели, и попробуйте ещё раз." };
}
