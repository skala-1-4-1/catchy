import { useEffect, useRef, useState } from "react";

export function useTypewriter(
  fullText: string,
  active: boolean,
  onDone?: () => void,
  charsPerTick = 4,
  intervalMs = 15,
): string {
  const [typedText, setTypedText] = useState("");
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) return;

    let index = 0;
    const resetTimer = setTimeout(() => setTypedText(""), 0);
    const tickTimer = setInterval(() => {
      index += charsPerTick;
      if (index >= fullText.length) {
        setTypedText(fullText);
        clearInterval(tickTimer);
        onDoneRef.current?.();
      } else {
        setTypedText(fullText.slice(0, index));
      }
    }, intervalMs);

    return () => {
      clearTimeout(resetTimer);
      clearInterval(tickTimer);
    };
  }, [fullText, active, charsPerTick, intervalMs]);

  return active ? typedText : fullText;
}
