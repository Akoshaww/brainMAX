"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RichText } from "@/components/rich-text";
import { SendResult } from "@/components/send-result";
import { siteConfig } from "@/config/site";
import { useSession } from "@/context/session-context";
import { questions } from "@/data/questions";
import { formatE164 } from "@/lib/phone";
import { formatDate, type CardData } from "@/lib/result-card";
import { calculateResult, getGrade } from "@/lib/scoring";

const R = 70;
const C = 2 * Math.PI * R;
const LETTERS = ["А", "Б", "В", "Г"];

export default function ResultsPage() {
  const router = useRouter();
  const { session, ready, retake, reset } = useSession();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/");
    else if (!session.finished) router.replace("/test");
  }, [ready, session, router]);

  const result = useMemo(() => (session ? calculateResult(session.answers) : null), [session]);
  const percent = result?.percent ?? 0;

  useEffect(() => {
    const t = setTimeout(() => setShown(percent), 150);
    return () => clearTimeout(t);
  }, [percent]);

  if (!ready || !session || !session.finished || !result) return null;

  const answered = Object.keys(session.answers).length;
  const grade = getGrade(result.percent);
  const card: CardData = {
    name: session.name,
    phone: formatE164(session.phone),
    correct: result.correct,
    total: result.total,
    answered,
    percent: result.percent,
    date: formatDate(session.finishedAt ?? session.startedAt),
  };

  const stats: [string, string][] = [
    ["Правильных", String(result.correct)],
    ["Неправильных", String(result.wrong)],
    ["Отвечено", `${answered} из ${result.total}`],
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
              strokeDashoffset={C * (1 - shown / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold">
            {result.percent}%
          </div>
        </div>

        <div className="animate-rise" style={{ animationDelay: "160ms" }}>
          <h1 className="font-display text-4xl font-bold">{grade.title}</h1>
          <p className="mt-2 text-muted">{grade.note}</p>
        </div>
      </div>

      <dl className="mt-10 border-t border-line">
        {[
          ["Ученик", session.name],
          ["Телефон", card.phone],
          ...stats,
          ["Дата", card.date],
        ].map(([label, value], i) => (
          <div
            key={label}
            className="animate-rise flex items-baseline justify-between gap-6 border-b border-line py-4"
            style={{ animationDelay: `${240 + i * 60}ms` }}
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
        <Link
          href="/"
          onClick={() => reset()}
          className="text-muted transition hover:text-accent"
        >
          Новый ученик
        </Link>
      </div>
    </div>
  );
}
