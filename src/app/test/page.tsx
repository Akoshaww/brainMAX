"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RichText } from "@/components/rich-text";
import { sections, sectionTitle } from "@/config/sections";
import { useSession } from "@/context/session-context";
import { getQuestions } from "@/data/questions";
import { LETTERS } from "@/lib/letters";

export default function TestPage() {
  const router = useRouter();
  const { session, ready, selectAnswer, goTo, finish } = useSession();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/");
    else if (session.finished) router.replace("/results");
  }, [ready, session, router]);

  // Esc закрывает окно подтверждения
  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirming(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  if (!ready || !session || session.finished) return null;

  const questions = getQuestions(session.lang);
  const total = questions.length;
  const index = Math.min(session.current, total - 1);
  const q = questions[index];
  const selected = session.answers[q.id];
  const answeredCount = questions.filter((x) => session.answers[x.id] !== undefined).length;
  const remaining = total - answeredCount;
  const isLast = index === total - 1;
  const sectionQuestions = questions.filter((x) => x.section === q.section);
  const positionInSection = sectionQuestions.indexOf(q) + 1;

  function doFinish() {
    finish();
    router.push("/results");
  }

  // Завершить можно в любой момент: если есть вопросы без ответа — сначала спрашиваем подтверждение
  function requestFinish() {
    if (remaining > 0) setConfirming(true);
    else doFinish();
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
        <p className="animate-rise text-xs font-semibold uppercase tracking-widest text-accent">
          {sectionTitle(q.section)} · {positionInSection} / {sectionQuestions.length}
          {q.part ? ` · ${q.part}` : ""}
        </p>
        {q.instruction && (
          <p className="animate-rise mt-2 text-sm leading-relaxed text-muted">{q.instruction}</p>
        )}
        <h1 className="animate-rise mt-4 whitespace-pre-line font-display text-xl font-bold leading-snug sm:text-2xl">
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
            onClick={requestFinish}
            className="bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-accent"
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

      {/* Навигатор по вопросам, сгруппирован по разделам */}
      <nav aria-label="Навигация по вопросам" className="mt-12 space-y-6 border-t border-line pt-6">
        {sections.map((sec) => {
          const items = questions.map((x, i) => ({ x, i })).filter(({ x }) => x.section === sec.id);
          if (items.length === 0) return null;
          const done = items.filter(({ x }) => session.answers[x.id] !== undefined).length;
          return (
            <div key={sec.id}>
              <p className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-widest text-muted">
                <span>{sec.title}</span>
                <span>
                  {done} / {items.length}
                </span>
              </p>
              <ul className="flex flex-wrap gap-2">
                {items.map(({ x, i }) => {
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
                          current ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-ink"
                        } ${answered ? "bg-ink text-paper" : "text-muted"}`}
                      >
                        {i + 1}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <p className="text-xs text-muted">Тёмные — с ответом, светлые — пока без ответа.</p>
      </nav>

      {/* Завершить можно в любой момент */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="text-sm text-muted">
          Отвечено {answeredCount} из {total}
        </p>
        <button
          type="button"
          onClick={requestFinish}
          className="border border-ink px-6 py-3 text-sm font-semibold uppercase tracking-widest transition hover:bg-ink hover:text-paper"
        >
          Завершить тест
        </button>
      </div>

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => setConfirming(false)}
        >
          <div className="animate-rise w-full max-w-md bg-paper p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <h2 id="confirm-title" className="font-display text-2xl font-bold">
              Завершить тест?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Вы ответили на {answeredCount} из {total} вопросов. Без ответа: {remaining} — они будут засчитаны как
              неверные. После завершения вернуться к тесту нельзя.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={doFinish}
                className="bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-accent"
              >
                Завершить
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirming(false)}
                className="border border-ink px-6 py-3 text-sm font-semibold uppercase tracking-widest transition hover:bg-ink hover:text-paper"
              >
                Вернуться к тесту
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
