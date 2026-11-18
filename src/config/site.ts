export const siteConfig = {
  brand: "Платформа тестов",
  /** WhatsApp преподавателя в международном формате */
  teacherWhatsApp: "+996706255952",
  /** Показывать ли ученику разбор правильных ответов на странице результатов */
  showCorrectAnswers: false,
} as const;

export function whatsappUrl(text: string): string {
  const digits = siteConfig.teacherWhatsApp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
