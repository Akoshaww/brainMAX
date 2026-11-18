/** Длина национальной части номера Кыргызстана (без +996). */
const LOCAL_LENGTH = 9;

/**
 * Достаёт из произвольного ввода до 9 цифр национальной части номера.
 * Понимает вставку вида «+996 555 123 456», «0555123456» и «555123456».
 */
export function extractLocalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length > LOCAL_LENGTH && digits.startsWith("996")) {
    digits = digits.slice(3);
  }
  return digits.slice(0, LOCAL_LENGTH);
}

/** 555123456 -> «555 123 456» */
export function formatLocal(digits: string): string {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(" ");
}

export function isValidLocal(digits: string): boolean {
  return digits.length === LOCAL_LENGTH;
}

export function toE164(digits: string): string {
  return `+996${digits}`;
}

/** +996555123456 -> «+996 555 123 456» */
export function formatE164(e164: string): string {
  const local = e164.replace(/\D/g, "").slice(3);
  return `+996 ${formatLocal(local)}`;
}
