"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RichText } from "@/components/rich-text";
import { useSession } from "@/context/session-context";
import { questions } from "@/data/questions";

const LETTERS = ["А", "Б", "В", "Г"];

export default function TestPage() {
  const router = useRouter();
  const { session, ready, selectAnswer, goTo, finish } = useSession();

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/");
    else if (session.finished) router.replace("/results");
  }, [ready, session, router]);

  if (!ready || !session || session.finished) return null;

  const total = questions.length;
  const index = Math.min(session.current, total - 1);
  const q = questions[index];
  const selected = session.answers[q.id];
  const answeredCount = questions.filter((x) => session.answers[x.id] !== undefined).length;
  const remaining = total - answeredCount;
  const isLast = index === total - 1;

  function handleFinish() {
    if (remaining > 0) return;
    finish();
    router.push("/results");
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Прогресс */}
      <div className="mb-10">
        <div className="mb-3 flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            Вопрос {index + 1} <span className="text-muted">из {total}</span>
          </span>
          <span className="text-muted">Отвечено: {answeredCount}</span>
        </div>
        <div
          className="h-1 bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answeredCount}
          aria-label="Прогресс теста"
        >
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Вопрос: key заново запускает анимацию при смене вопроса */}
      <div key={q.id}>
        {q.section && (
          <p className="animate-rise mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            {q.section}
          </p>
        )}
        <h1 className="animate-rise whitespace-pre-line font-display text-xl font-bold leading-snug sm:text-2xl">
          <RichText text={q.text} />
        </h1>

        <div role="radiogroup" aria-label="Варианты ответа" className="mt-8">
          {q.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => selectAnswer(q.id, i)}
                className={`animate-rise group flex w-full items-center gap-5 border-t border-line py-5 text-left transition last:border-b ${
                  isSelected ? "text-accent" : "hover:pl-2"
                }`}
                style={{ animationDelay: `${120 + i * 70}ms` }}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center border text-sm font-semibold transition ${
                    isSelected
                      ? "border-accent bg-accent text-white"
                      : "border-line text-muted group-hover:border-ink group-hover:text-ink"
                  }`}
                >
                  {LETTERS[i]}
                </span>
                <span className="text-base sm:text-lg">
                  <RichText text={option} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Навигация */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="px-2 py-3 text-sm font-semibold uppercase tracking-widest transition hover:text-accent disabled:opacity-30 disabled:hover:text-ink"
        >
          ← Назад
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleFinish}
            disabled={remaining > 0}
            className="bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-ink"
          >
            Завершить тест
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-accent"
          >
            Далее →
          </button>
        )}
      </div>

      {isLast && remaining > 0 && (
        <p className="mt-4 text-right text-sm text-red-700">
          Остались вопросы без ответа: {remaining}. Вернитесь к ним по номерам ниже.
        </p>
      )}

      {/* Навигатор по вопросам */}
      <nav aria-label="Навигация по вопросам" className="mt-12 border-t border-line pt-6">
        <ul className="flex flex-wrap gap-2">
          {questions.map((x, i) => {
            const answered = session.answers[x.id] !== undefined;
            const current = i === index;
            return (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Вопрос ${i + 1}${answered ? ", есть ответ" : ", без ответа"}`}
                  aria-current={current ? "step" : undefined}
                  className={`size-10 border text-sm font-semibold transition ${
                    current
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-line hover:border-ink"
                  } ${answered ? "bg-ink text-paper" : "text-muted"}`}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">Тёмные — с ответом, светлые — пока без ответа.</p>
      </nav>

      {/* Завершение доступно и не с последнего вопроса */}
      {!isLast && remaining === 0 && (
        <div className="mt-8 border border-line p-5">
          <p className="text-sm text-muted">Вы ответили на все вопросы.</p>
          <button
            type="button"
            onClick={handleFinish}
            className="mt-3 bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-ink"
          >
            Завершить тест
          </button>
        </div>
      )}
    </div>
  );
}
