import { questions } from "@/data/questions";
import type { TestResult } from "@/lib/types";

export function calculateResult(answers: Record<number, number>): TestResult {
  const total = questions.length;
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  return {
    total,
    correct,
    wrong: total - correct,
    percent: Math.round((correct / total) * 100),
  };
}

export function getGrade(percent: number): { title: string; note: string } {
  if (percent >= 90) return { title: "Отлично", note: "Почти безупречный результат." };
  if (percent >= 70) return { title: "Хорошо", note: "Крепкая база — осталось отшлифовать детали." };
  if (percent >= 50) return { title: "Удовлетворительно", note: "Есть над чем поработать — разберите ошибки ниже." };
  return { title: "Нужно подтянуть", note: "Не страшно: разберите ответы и попробуйте ещё раз." };
}
