"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RichText } from "@/components/rich-text";
import { SendResult } from "@/components/send-result";
import { languages } from "@/config/languages";
import { siteConfig } from "@/config/site";
import { useSession } from "@/context/session-context";
import { getQuestions } from "@/data/questions";
import { LETTERS } from "@/lib/letters";
import { formatE164 } from "@/lib/phone";
import { formatDate, type CardData } from "@/lib/result-card";
import { calculateResult, getGrade } from "@/lib/scoring";

const R = 70;
const C = 2 * Math.PI * R;

export default function ResultsPage() {
  const router = useRouter();
  const { session, ready, retake, reset } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/");
    else if (!session.finished) router.replace("/test");
  }, [ready, session, router]);

  // Небольшая задержка, чтобы прогресс-кольцо и полосы раздела анимировались
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const questions = useMemo(() => (session ? getQuestions(session.lang) : []), [session]);
  const result = useMemo(
    () => (session ? calculateResult(session.answers, questions) : null),
    [session, questions],
  );

  if (!ready || !session || !session.finished || !result) return null;

  const grade = getGrade(result.percent);
  const langLabel = languages.find((l) => l.id === session.lang)?.label ?? "";
  const card: CardData = {
    name: session.name,
    phone: formatE164(session.phone),
    correct: result.correct,
    total: result.total,
    answered: result.answered,
    percent: result.percent,
    date: formatDate(session.finishedAt ?? session.startedAt),
    sections: result.sections.map(({ title, correct, total, percent }) => ({ title, correct, total, percent })),
  };

  const details: [string, string][] = [
    ["Ученик", session.name],
    ["Телефон", card.phone],
    ["Язык теста", langLabel],
    ["Правильных", String(result.correct)],
    ["Неправильных", String(result.wrong)],
    ["Отвечено", `${result.answered} из ${result.total}`],
    ["Дата", card.date],
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="animate-rise text-xs font-semibold uppercase tracking-widest text-accent">Ваш результат</p>

      <div className="mt-6 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
        <div className="animate-rise relative size-44 shrink-0" style={{ animationDelay: "80ms" }}>
          <svg viewBox="0 0 160 160" className="size-full -rotate-90" aria-hidden>
            <circle cx="80" cy="80" r={R} fill="none" strokeWidth="8" className="stroke-line" />
            <circle
              cx="80"
              cy="80"
              r={R}
              fill="none"
              strokeWidth="8"
              strokeLinecap="butt"
              className="stroke-accent transition-[stroke-dashoffset] duration-1000 ease-out"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (mounted ? result.percent : 0) / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold">
            {result.percent}%
          </div>
        </div>

        <div className="animate-rise" style={{ animationDelay: "160ms" }}>
          <h1 className="font-display text-4xl font-bold">{grade.title}</h1>
          <p className="mt-2 text-muted">{grade.note}</p>
          <p className="mt-3 text-sm text-muted">
            {result.correct} из {result.total} правильных ответов
          </p>
        </div>
      </div>

      {/* Результат по разделам */}
      <section className="mt-10" aria-labelledby="by-section">
        <h2 id="by-section" className="text-xs font-semibold uppercase tracking-widest text-muted">
          По разделам
        </h2>
        <ul className="mt-4">
          {result.sections.map((s, i) => (
            <li
              key={s.id}
              className="animate-rise border-t border-line py-4 last:border-b"
              style={{ animationDelay: `${240 + i * 80}ms` }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold">{s.title}</span>
                <span className="text-sm text-muted">
                  {s.correct} из {s.total} · <span className="font-semibold text-ink">{s.percent}%</span>
                </span>
              </div>
              <div className="mt-3 h-1 bg-line">
                <div
                  className="h-full bg-accent transition-[width] duration-1000 ease-out"
                  style={{ width: `${mounted ? s.percent : 0}%` }}
                />
              </div>
              {s.answered < s.total && (
                <p className="mt-2 text-xs text-muted">Без ответа: {s.total - s.answered}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <dl className="mt-10 border-t border-line">
        {details.map(([label, value], i) => (
          <div
            key={label}
            className="animate-rise flex items-baseline justify-between gap-6 border-b border-line py-4"
            style={{ animationDelay: `${480 + i * 50}ms` }}
          >
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      {siteConfig.showCorrectAnswers && (
        <ol className="mt-10">
          {questions.map((q, i) => {
            const picked = session.answers[q.id];
            const ok = picked === q.correctIndex;
            return (
              <li key={q.id} className="border-t border-line py-4 last:border-b">
                <p className="whitespace-pre-line font-semibold">
                  {i + 1}. <RichText text={q.text} />
                </p>
                <p className="mt-1 text-sm">
                  <span className={ok ? "text-emerald-700" : "text-red-700"}>
                    Ваш ответ:{" "}
                    {picked !== undefined ? (
                      <>
                        {LETTERS[picked]}. <RichText text={q.options[picked]} />
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                  {!ok && (
                    <span className="text-muted">
                      {" "}
                      · Верно: {LETTERS[q.correctIndex]}. <RichText text={q.options[q.correctIndex]} />
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-10">
        <SendResult data={card} />
      </div>

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 text-sm font-semibold uppercase tracking-widest">
        <button
          type="button"
          onClick={() => {
            retake();
            router.push("/test");
          }}
          className="transition hover:text-accent"
        >
          Пройти заново
        </button>
        <Link href="/" onClick={() => reset()} className="text-muted transition hover:text-accent">
          Новый ученик
        </Link>
      </div>
    </div>
  );
}
