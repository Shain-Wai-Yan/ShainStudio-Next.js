import React from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  delay?: number;
}

/**
 * A free alternative to GSAP's premium SplitText plugin.
 * Wraps words and characters in overflow-hidden containers for buttery smooth entrance animations.
 */
export const SplitTextTitle: React.FC<SplitTextProps> = ({
  text,
  className = "",
  wordClassName = "",
  charClassName = "split-char",
}) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap ${className}`} aria-label={text}>
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          <span
            className={`inline-flex overflow-hidden ${wordClassName}`}
            aria-hidden="true"
          >
            {word.split("").map((char, charIndex) => (
              <span
                key={charIndex}
                className={`inline-block translate-y-[120%] rotate-3 opacity-0 will-change-transform ${charClassName}`}
              >
                {char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 && (
            <span className="inline-block w-[0.25em]" aria-hidden="true">&nbsp;</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
