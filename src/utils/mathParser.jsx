import React, { useMemo } from "react";
import MathRenderer from "../components/MathRenderer";

// Placeholder used to temporarily replace \$ during parsing so it is never
// mistaken for a math delimiter.
const ESC = "\x00ESCUSD\x00";

/**
 * Splits `text` into an array of plain-text spans and <MathRenderer> nodes.
 *
 * Priority / rules:
 *  1. $$...$$ block math is extracted first (highest priority).
 *  2. Remaining text segments are scanned for $...$ inline math.
 *  3. Unclosed delimiters are emitted as plain text — never throws.
 *  4. Empty math blocks ($$ $$) are silently skipped.
 *  5. \$ is treated as a literal dollar sign.
 *  6. A $ immediately adjacent to another $ is NOT treated as inline math
 *     (those are part of $$ and handled in step 1).
 *
 * @param {string} text
 * @returns {React.ReactNode[]}
 */
export function parseAndRenderMath(text) {
  if (!text || typeof text !== "string") return [text ?? ""];

  // 1. Protect escaped dollar signs.
  const processed = text.replace(/\\\$/g, ESC);

  const nodes = [];
  let key = 0;

  // 2. Split on $$...$$ (block math).  Non-greedy so multiple blocks work.
  //    The capturing group keeps the delimiters in the resulting array.
  const blockSegments = processed.split(/(\$\$[\s\S]*?\$\$)/);

  for (const segment of blockSegments) {
    // Segment is a $$...$$ block?
    if (segment.startsWith("$$") && segment.endsWith("$$") && segment.length > 4) {
      const expr = segment.slice(2, -2).trim();
      if (expr) {
        nodes.push(<MathRenderer key={key++} content={expr} block={true} />);
      }
      // Empty $$ $$ → skip silently
      continue;
    }

    // 3. Within non-block segments, split on $...$ inline math.
    //    Regex: a single $ (not followed by another $, and not preceded by
    //    another $), then one or more non-$ non-newline chars (non-greedy),
    //    then a closing $ (not followed by another $).
    const inlineSegments = segment.split(/(\$(?!\$)(?:[^$\n])+?(?<!\$)\$)/);

    for (const inSeg of inlineSegments) {
      if (
        inSeg.startsWith("$") &&
        inSeg.endsWith("$") &&
        inSeg.length > 2 &&
        !inSeg.startsWith("$$") &&
        !inSeg.endsWith("$$")
      ) {
        const expr = inSeg.slice(1, -1).trim();
        if (expr) {
          nodes.push(<MathRenderer key={key++} content={expr} block={false} />);
          continue;
        }
      }

      // Plain text — restore any escaped dollar signs.
      const restored = inSeg.replace(new RegExp(ESC, "g"), "$");
      if (restored) {
        nodes.push(<span key={key++}>{restored}</span>);
      }
    }
  }

  return nodes;
}

/**
 * React hook version — memoises the result so the nodes array is stable
 * across re-renders when `text` hasn't changed.
 *
 * @param {string} text
 * @returns {React.ReactNode[]}
 */
export function useMathParser(text) {
  return useMemo(() => parseAndRenderMath(text), [text]);
}
