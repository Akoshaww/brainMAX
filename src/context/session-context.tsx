"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Lang } from "@/config/languages";
import { getQuestions } from "@/data/questions";
import type { Session } from "@/lib/types";

// v2: добавлены язык и разделы, старые сохранения несовместимы.
// localStorage — прогресс переживает закрытие вкладки и браузера.
const STORAGE_KEY = "test-session-v2";

/* ---------- Мини-хранилище поверх localStorage ---------- */

const listeners = new Set<() => void>();
let memoryFallback: string | null = null; // если localStorage недоступен

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) cb(); // изменения из другой вкладки
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryFallback;
  }
}

function writeRaw(value: string | null) {
  memoryFallback = value;
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* работаем только в памяти */
  }
  listeners.forEach((l) => l());
}

function parse(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function update(fn: (s: Session) => Session) {
  const current = parse(readRaw());
  if (current) writeRaw(JSON.stringify(fn(current)));
}

const noopSubscribe = () => () => {};

/* ---------- Контекст ---------- */

type SessionContextValue = {
  session: Session | null;
  /** false, пока состояние не восстановлено на клиенте */
  ready: boolean;
  start: (name: string, phone: string, lang: Lang) => void;
  selectAnswer: (questionId: number, optionIndex: number) => void;
  goTo: (index: number) => void;
  finish: () => void;
  /** Начать заново с теми же именем, номером и языком */
  retake: () => void;
  /** Полный выход */
  reset: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function createSession(name: string, phone: string, lang: Lang): Session {
  return { name, phone, lang, answers: {}, current: 0, finished: false, startedAt: Date.now() };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const session = useMemo(() => parse(raw), [raw]);

  const start = useCallback(
    (name: string, phone: string, lang: Lang) =>
      writeRaw(JSON.stringify(createSession(name, phone, lang))),
    [],
  );

  const selectAnswer = useCallback((questionId: number, optionIndex: number) => {
    update((s) =>
      s.finished ? s : { ...s, answers: { ...s.answers, [questionId]: optionIndex } },
    );
  }, []);

  const goTo = useCallback((index: number) => {
    update((s) => {
      if (s.finished) return s;
      const last = getQuestions(s.lang).length - 1;
      return { ...s, current: Math.max(0, Math.min(last, index)) };
    });
  }, []);

  const finish = useCallback(() => {
    update((s) => ({ ...s, finished: true, finishedAt: Date.now() }));
  }, []);

  const retake = useCallback(() => update((s) => createSession(s.name, s.phone, s.lang)), []);

  const reset = useCallback(() => writeRaw(null), []);

  const value = useMemo(
    () => ({ session, ready, start, selectAnswer, goTo, finish, retake, reset }),
    [session, ready, start, selectAnswer, goTo, finish, retake, reset],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession должен использоваться внутри <SessionProvider>");
  return ctx;
}
