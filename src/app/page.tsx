"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, inputClass } from "@/components/field";
import { useSession } from "@/context/session-context";
import { questions } from "@/data/questions";
import { extractLocalDigits, formatLocal, isValidLocal, toE164, formatE164 } from "@/lib/phone";

const steps = [
  ["Регистрация", "Имя и номер телефона — больше ничего не нужно."],
  ["Тест", `${questions.length} вопросов, в каждом один верный ответ из четырёх.`],
  ["Результат", "Баллы и процент появятся сразу после завершения."],
];

export default function RegisterPage() {
  const router = useRouter();
  const { session, ready, start } = useSession();
  const [name, setName] = useState("");
  const [digits, setDigits] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmed = name.trim().replace(/\s+/g, " ");
  const nameError = submitted && trimmed.length < 2 ? "Введите имя (не короче 2 символов)" : undefined;
  const phoneError =
    submitted && !isValidLocal(digits) ? "Введите 9 цифр номера, например 555 123 456" : undefined;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (trimmed.length < 2 || !isValidLocal(digits)) return;
    start(trimmed, toE164(digits));
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
