import { useEffect, useRef, useState } from "react";

export function useTypewriter(
  fullText: string,
  active: boolean,
  onDone?: () => void,
  charsPerTick = 4,
  intervalMs = 15,
): string {
  const [text, setText] = useState(() => (active ? "" : fullText));
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) return;

    let index = 0;
    const timer = setInterval(() => {
      index += charsPerTick;
      if (index >= fullText.length) {
        setText(fullText);
        clearInterval(timer);
        onDoneRef.current?.();
      } else {
        setText(fullText.slice(0, index));
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [fullText, active, charsPerTick, intervalMs]);

  return text;
}
