"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-context";
import { siteConfig } from "@/config/site";

export function Header() {
  const router = useRouter();
  const { session, reset } = useSession();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          {siteConfig.brand}
          <span className="text-accent">.</span>
        </Link>
        {session && (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden max-w-48 truncate text-muted sm:inline">{session.name}</span>
            <button
              type="button"
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="underline-offset-4 transition hover:text-accent hover:underline"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
