"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMessage, renderResultCard, type CardData } from "@/lib/result-card";
import { whatsappUrl } from "@/config/site";

export function SendResult({ data }: { data: CardData }) {
  const [open, setOpen] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const message = useMemo(() => buildMessage(data), [data]);
  const previewUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  const fileName = `result-${data.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "student"}.png`;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleOpen() {
    setOpen(true);
    setError(null);
    try {
      setBlob(await renderResultCard(data));
    } catch {
      setError("Не удалось создать карточку. Попробуйте ещё раз.");
    }
  }

  function makeFile(): File | null {
    return blob ? new File([blob], fileName, { type: "image/png" }) : null;
  }

  const file = makeFile();
  const canShareFile =
    typeof navigator !== "undefined" &&
    !!file &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  async function shareImage() {
    if (!file) return;
    try {
      await navigator.share({ files: [file], text: message });
    } catch (e) {
      if ((e as DOMException).name !== "AbortError") setError("Не удалось открыть меню «Поделиться».");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="w-full bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-accent sm:w-auto"
      >
        Отправить результат
      </button>
    );
  }

  return (
    <div className="animate-rise border border-line p-5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">Карточка результата</p>

      <div className="mt-5 flex aspect-[1080/1350] w-full max-w-sm items-center justify-center bg-line/40">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={`Карточка результата: ${data.name}, ${data.percent}%`} className="size-full" />
        ) : (
          <span className="text-sm text-muted">{error ?? "Создаём карточку…"}</span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {previewUrl && (
          <a
            href={previewUrl}
            download={fileName}
            className="border border-ink px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest transition hover:bg-ink hover:text-paper"
          >
            Скачать PNG
          </a>
        )}
        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-ink"
        >
          Отправить преподавателю
        </a>
        {canShareFile && (
          <button
            type="button"
            onClick={shareImage}
            className="border border-line px-6 py-3 text-sm font-semibold uppercase tracking-widest transition hover:border-ink"
          >
            Поделиться картинкой
          </button>
        )}
      </div>

      <p className="mt-5 max-w-md text-sm text-muted">
        WhatsApp не позволяет приложить изображение по ссылке. Кнопка «Отправить преподавателю» откроет чат с
        готовым текстом — скачайте PNG и прикрепите его к сообщению
        {canShareFile ? ", либо поделитесь картинкой напрямую." : "."}
      </p>
      {error && previewUrl && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
