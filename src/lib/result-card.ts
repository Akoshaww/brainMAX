import { siteConfig } from "@/config/site";

export type CardData = {
  name: string;
  phone: string;
  correct: number;
  total: number;
  answered: number;
  percent: number;
  date: string;
};

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildMessage(d: CardData): string {
  return [
    "Здравствуйте! Мой результат теста:",
    `Ученик: ${d.name}`,
    `Телефон: ${d.phone}`,
    `Правильных ответов: ${d.correct} из ${d.total} (${d.percent}%)`,
    `Дата: ${d.date}`,
  ].join("\n");
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, size: number, weight: number, family: string) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && s > 28) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  let out = text;
  while (ctx.measureText(out).width > maxWidth && out.length > 1) out = out.slice(0, -1);
  return out === text ? text : out.trimEnd() + "…";
}

/** Рисует карточку результата в PNG без сторонних библиотек. */
export async function renderResultCard(d: CardData): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts) await document.fonts.ready;

  const W = 1080;
  const H = 1350;
  const pad = 88;
  const sans = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const serif = "Georgia, 'Times New Roman', serif";
  const ink = "#141414";
  const muted = "#6b6b66";
  const line = "#dcd8cf";
  const accent = "#3b47e8";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен");

  ctx.fillStyle = "#f7f5f0";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 14);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // Шапка
  ctx.fillStyle = muted;
  ctx.font = `600 26px ${sans}`;
  ctx.fillText("РЕЗУЛЬТАТ ТЕСТА", pad, 110);
  ctx.textAlign = "right";
  ctx.fillText(siteConfig.brand.toUpperCase(), W - pad, 110);
  ctx.textAlign = "left";

  ctx.fillStyle = line;
  ctx.fillRect(pad, 140, W - pad * 2, 2);

  // Ученик
  ctx.fillStyle = muted;
  ctx.font = `500 26px ${sans}`;
  ctx.fillText("Ученик", pad, 220);
  ctx.fillStyle = ink;
  ctx.fillText(fit(ctx, d.name, W - pad * 2, 64, 700, serif), pad, 295);

  ctx.fillStyle = muted;
  ctx.font = `500 26px ${sans}`;
  ctx.fillText("Телефон", pad, 380);
  ctx.fillStyle = ink;
  ctx.font = `600 40px ${sans}`;
  ctx.fillText(d.phone, pad, 435);

  ctx.fillStyle = line;
  ctx.fillRect(pad, 490, W - pad * 2, 2);

  // Процент
  ctx.fillStyle = accent;
  ctx.font = `700 260px ${serif}`;
  ctx.fillText(`${d.percent}%`, pad - 8, 760);

  ctx.fillStyle = ink;
  ctx.font = `600 44px ${sans}`;
  ctx.fillText(`${d.correct} из ${d.total} правильных ответов`, pad, 840);

  // Полоса
  const barW = W - pad * 2;
  ctx.fillStyle = line;
  ctx.fillRect(pad, 890, barW, 16);
  ctx.fillStyle = accent;
  ctx.fillRect(pad, 890, (barW * d.percent) / 100, 16);

  ctx.fillStyle = line;
  ctx.fillRect(pad, 980, W - pad * 2, 2);

  // Статистика
  const cols: [string, string][] = [
    ["Правильных", String(d.correct)],
    ["Неправильных", String(d.total - d.correct)],
    ["Отвечено", `${d.answered} / ${d.total}`],
  ];
  const colW = (W - pad * 2) / 3;
  cols.forEach(([label, value], i) => {
    const x = pad + colW * i;
    ctx.fillStyle = muted;
    ctx.font = `500 24px ${sans}`;
    ctx.fillText(label, x, 1040);
    ctx.fillStyle = ink;
    ctx.font = `700 48px ${sans}`;
    ctx.fillText(value, x, 1100);
  });

  // Подвал
  ctx.fillStyle = line;
  ctx.fillRect(pad, 1180, W - pad * 2, 2);
  ctx.fillStyle = muted;
  ctx.font = `500 28px ${sans}`;
  ctx.fillText(`Дата прохождения: ${d.date}`, pad, 1250);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Не удалось создать PNG"))), "image/png"),
  );
}
