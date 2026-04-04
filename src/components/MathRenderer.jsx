import React from "react";
import katex from "katex";

/**
 * Renders a LaTeX math expression using KaTeX.
 *
 * Props:
 *   content {string} – The raw LaTeX expression (no surrounding $ or $$ delimiters).
 *   block   {boolean} – true → display/block mode ($$...$$); false (default) → inline ($...$).
 */
export default function MathRenderer({ content, block = false }) {
  const html = katex.renderToString(content, {
    throwOnError: false,
    displayMode: block,
  });

  if (block) {
    return (
      <div
        className="overflow-x-auto my-4 text-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className="inline-math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
