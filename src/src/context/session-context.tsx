"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { questions } from "@/data/questions";
import type { Session } from "@/lib/types";

const STORAGE_KEY = "test-session-v1";

/* ---------- Мини-хранилище поверх sessionStorage ---------- */

const listeners = new Set<() => void>();
let memoryFallback: string | null = null; // если sessionStorage недоступен

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryFallback;
  }
}

function writeRaw(value: string | null) {
  memoryFallback = value;
  try {
    if (value === null) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, value);
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
  start: (name: string, phone: string) => void;
  selectAnswer: (questionId: number, optionIndex: number) => void;
  goTo: (index: number) => void;
  finish: () => void;
  /** Начать заново с теми же именем и номером */
  retake: () => void;
  /** Полный выход */
  reset: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function createSession(name: string, phone: string): Session {
  return { name, phone, answers: {}, current: 0, finished: false, startedAt: Date.now() };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const session = useMemo(() => parse(raw), [raw]);

  const start = useCallback(
    (name: string, phone: string) => writeRaw(JSON.stringify(createSession(name, phone))),
    [],
  );

  const selectAnswer = useCallback((questionId: number, optionIndex: number) => {
    update((s) =>
      s.finished ? s : { ...s, answers: { ...s.answers, [questionId]: optionIndex } },
    );
  }, []);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(questions.length - 1, index));
    update((s) => (s.finished ? s : { ...s, current: clamped }));
  }, []);

  const finish = useCallback(() => {
    update((s) => ({ ...s, finished: true, finishedAt: Date.now() }));
  }, []);

  const retake = useCallback(() => update((s) => createSession(s.name, s.phone)), []);

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
