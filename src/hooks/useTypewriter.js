import { useState, useEffect, useRef } from "react";

export default function useTypewriter(texts, speed = 60, pauseDuration = 2000, deleteSpeed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const current = texts[indexRef.current];
    let timeout;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), speed);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), deleteSpeed);
    } else if (isDeleting && displayed.length === 0) {
      indexRef.current = (indexRef.current + 1) % texts.length;
      setIsDeleting(false);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, texts, speed, pauseDuration, deleteSpeed]);

  return displayed;
}