import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed: number = 100) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Only proceed if we haven't finished typing
    if (displayedText.length >= text.length) {
      if (!isComplete) {
        setIsComplete(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, text, speed, isComplete]);

  return { displayedText, isComplete };
}
