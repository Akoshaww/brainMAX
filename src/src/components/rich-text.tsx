/** Выделяет фрагменты, обёрнутые в **двойные звёздочки** (в ОРТ это «асты сызылган сөз»). */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold underline decoration-accent decoration-2 underline-offset-4">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
