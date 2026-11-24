"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, inputClass } from "@/components/field";
import { DEFAULT_LANG, languages, type Lang } from "@/config/languages";
import { sections } from "@/config/sections";
import { useSession } from "@/context/session-context";
import { getQuestions } from "@/data/questions";
import { extractLocalDigits, formatLocal, isValidLocal, toE164, formatE164 } from "@/lib/phone";

export default function RegisterPage() {
  const router = useRouter();
  const { session, ready, start } = useSession();
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [name, setName] = useState("");
  const [digits, setDigits] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmed = name.trim().replace(/\s+/g, " ");
  const nameError = submitted && trimmed.length < 2 ? "Введите имя (не короче 2 символов)" : undefined;
  const phoneError =
    submitted && !isValidLocal(digits) ? "Введите 9 цифр номера, например 555 123 456" : undefined;

  const bank = getQuestions(lang);
  const sectionTitles = sections
    .filter((s) => bank.some((q) => q.section === s.id))
    .map((s) => s.title.toLowerCase());

  const steps = [
    ["Регистрация", "Язык теста, имя и номер телефона — больше ничего не нужно."],
    [
      "Тест",
      `Всего ${bank.length} вопросов, в каждом один верный ответ из четырёх. Разделы: ${sectionTitles.join(", ")}.`,
    ],
    ["Результат", "Общий процент и процент по каждому разделу появятся сразу после завершения."],
  ];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (trimmed.length < 2 || !isValidLocal(digits)) return;
    start(trimmed, toE164(digits), lang);
    router.push("/test");
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      <section className="animate-rise">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Онлайн-тест</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
          Проверьте свои знания
        </h1>
        <ol className="mt-10">
          {steps.map(([title, text], i) => (
            <li
              key={title}
              className="animate-rise flex gap-5 border-t border-line py-5 last:border-b"
              style={{ animationDelay: `${150 + i * 90}ms` }}
            >
              <span className="font-mono text-sm text-muted">0{i + 1}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="animate-rise" style={{ animationDelay: "120ms" }}>
        {ready && session && (
          <div className="mb-8 border border-line p-4 text-sm">
            <p className="text-muted">
              {session.finished ? "Тест уже пройден" : "У вас есть незавершённый тест"}: {session.name},{" "}
              {formatE164(session.phone)}
            </p>
            <Link
              href={session.finished ? "/results" : "/test"}
              className="mt-2 inline-block font-semibold text-accent underline-offset-4 hover:underline"
            >
              {session.finished ? "Открыть результат →" : "Продолжить →"}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          <fieldset className="pb-4">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
              Язык теста
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((l) => {
                const active = lang === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    disabled={!l.available}
                    aria-pressed={active}
                    onClick={() => setLang(l.id)}
                    className={`border px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-line hover:border-ink disabled:hover:border-line"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {l.label}
                    {!l.available && (
                      <span className="ml-2 text-xs font-normal uppercase tracking-widest">скоро</span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field id="name" label="Имя" error={nameError}>
            <input
              id="name"
              type="text"
              autoComplete="name"
              maxLength={60}
              placeholder="Как вас зовут"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field id="phone" label="Номер телефона" error={phoneError}>
            <div className="flex items-baseline gap-3 border-b-2 border-line transition focus-within:border-accent">
              <span className="text-lg text-muted">+996</span>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="555 123 456"
                value={formatLocal(digits)}
                onChange={(e) => setDigits(extractLocalDigits(e.target.value))}
                className="w-full bg-transparent py-3 text-lg outline-none placeholder:text-muted/60"
              />
            </div>
          </Field>

          <button
            type="submit"
            className="mt-4 w-full bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-accent"
          >
            Начать тест
          </button>
        </form>
      </section>
    </div>
  );
}
