import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { parseAndRenderMath } from "../utils/mathParser";
import MathRenderer from "./MathRenderer";

function ArtifactSection({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-3xl border border-[#95ff00]/20 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-cyan-950/25 p-5 md:p-6 shadow-[0_24px_80px_rgba(6,182,212,0.12)]">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#95ff00]/80">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
        </div>
        {description && (
          <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function sanitizeMermaid(code) {
  if (!code) return code;
  return code
    // Fix mixed edge label syntax: "-- text -->|label|" → "-->|text: label|"
    // e.g. "Cache -- Yes -->|Return IP| Client" is invalid; only one label style per edge.
    .replace(/--\s*([^|>\n\-][^|\n]*?)\s*-->\|([^|]+)\|/g, '-->|$1: $2|')
    // Remove composite state blocks that self-reference as initial state (causes cycle error)
    // e.g. "state Ready {\n    [*] --> Ready\n}"
    .replace(
      /^\s*state\s+(\w+)\s*\{[^}]*\[\*\]\s*-->\s*\1[^}]*\}\s*$/gm,
      ""
    )
    // ER diagram: bare } or { cardinality markers must have | or o suffix/prefix.
    // }--  →  }|--   (e.g. }--|| becomes }|--||)
    // --{  →  --|{   (e.g. ||--{ becomes ||--|{)
    .replace(/}--(?![|o])/g, "}|--")
    .replace(/--\{(?![|o])/g, "--|{")
    .trim();
}

function MermaidBlock({ code, title, index }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState(null);
  const [error, setError] = useState(null);

  // Compute cleanCode in component scope so JSX render can access it
  const cleanCode = sanitizeMermaid(code);

  useEffect(() => {
    if (!cleanCode || !containerRef.current) return;
    let cancelled = false;
    const id = `mermaid-${index}-${Date.now()}`;
    import("mermaid")
      .then(async ({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          suppressErrorRendering: true,
          themeVariables: {
            primaryColor: "#0f172a",
            primaryBorderColor: "#22d3ee",
            primaryTextColor: "#e2e8f0",
            lineColor: "#67e8f9",
            tertiaryColor: "#111827",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
        });
        // Validate syntax before rendering to avoid bomb-icon error SVGs
        try {
          await mermaid.parse(cleanCode);
        } catch (parseErr) {
          if (!cancelled) setError(String(parseErr?.message || parseErr));
          return;
        }
        const { svg: result } = await mermaid.render(id, cleanCode);
        if (!cancelled) setSvg(result);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e.message || e));
      });
    return () => { cancelled = true; };
  }, [cleanCode, index]);

  return (
    <ArtifactSection
      eyebrow="Visual Flow"
      title={title || "Diagram"}
      description="A structured visual generated from the summary. If rendering fails, the raw Mermaid source is shown below."
    >
      <div className="overflow-x-auto rounded-2xl border border-[#95ff00]/15 bg-slate-950/70 p-4">
        <div ref={containerRef} className="mermaid-container flex min-w-[540px] justify-center">
          {error && (
            <div className="w-full space-y-3">
              <p className="text-sm text-amber-400">Diagram could not be rendered: {error}</p>
              <pre className="overflow-x-auto rounded-2xl border border-amber-500/20 bg-black/40 p-4 text-xs text-slate-300">
                {cleanCode}
              </pre>
            </div>
          )}
          {svg && (
            <div
              className="mermaid-svg"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>
    </ArtifactSection>
  );
}

function TimelineArtifact({ data }) {
  const events = data?.events || [];
  return (
    <ArtifactSection
      eyebrow="Sequence"
      title="Learning timeline"
      description="Use this as a quick progression map for the order in which ideas appear in the video."
    >
      <div className="space-y-4">
        {events.map((evt, i) => (
          <div key={i} className="grid grid-cols-[72px_1fr] gap-4 rounded-2xl border border-[#95ff00]/15 bg-black/25 p-4">
            <div className="flex items-center justify-center rounded-xl bg-[#95ff00]/10 font-mono text-sm font-semibold text-cyan-300">
              {evt.time}
            </div>
            <div className="relative">
              {i < events.length - 1 && (
                <span className="absolute -bottom-5 left-0 top-10 w-px bg-gradient-to-b from-[#95ff00]/70 to-transparent" />
              )}
              <p className="text-sm font-medium text-white">{evt.title}</p>
            </div>
          </div>
        ))}
      </div>
    </ArtifactSection>
  );
}

function LearningJourneyArtifact({ data }) {
  const stages = data?.stages || [];
  return (
    <ArtifactSection
      eyebrow="Progression"
      title="Learning journey"
      description="A staged path through the topic so learners can see how understanding should build from one step to the next."
    >
      <div className="space-y-4">
        {stages.map((stage, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden rounded-3xl border border-[#95ff00]/20 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-emerald-950/30 p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {i < stages.length - 1 && (
              <span className="absolute bottom-[-18px] left-10 top-[92px] w-px bg-gradient-to-b from-[#95ff00]/60 to-transparent" />
            )}
            <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)_280px]">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#95ff00]/25 bg-[#95ff00]/10 text-lg font-bold text-cyan-200">
                  {i + 1}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#95ff00]/80">
                  {stage.stage}
                </span>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-white">{stage.title}</h5>
                <p className="mt-2 text-sm leading-6 text-slate-300">{stage.focus}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(stage.details || []).map((detail, detailIndex) => (
                    <span
                      key={detailIndex}
                      className="rounded-full border border-[#95ff00]/20 bg-[#95ff00]/8 px-3 py-1 text-xs text-cyan-100"
                    >
                      {parseAndRenderMath(detail)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#95ff00]/20 bg-[#95ff00]/10 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                  Checkpoint
                </div>
                <p className="mt-2 text-sm leading-6 text-emerald-50/90">{parseAndRenderMath(stage.checkpoint)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ArtifactSection>
  );
}

function MisconceptionMatrixArtifact({ data }) {
  const items = data?.items || [];
  return (
    <ArtifactSection
      eyebrow="Debug Thinking"
      title="Misconception matrix"
      description="Use this to catch wrong mental models early and replace them with the correct interpretation."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/30 via-slate-950/95 to-emerald-950/20 p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="grid gap-4">
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-300/80">Common mistake</div>
                <p className="mt-2 text-sm leading-6 text-rose-50/95">{parseAndRenderMath(item.misconception)}</p>
              </div>
              <div className="rounded-2xl border border-[#95ff00]/20 bg-[#95ff00]/10 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Correct view</div>
                <p className="mt-2 text-sm leading-6 text-emerald-50/95">{parseAndRenderMath(item.correction)}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[#95ff00]/15 bg-black/25 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Why confusing</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.why_confusing}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/15 bg-amber-500/10 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/80">Recognition clue</div>
                  <p className="mt-2 text-sm leading-6 text-amber-50/95">{item.recognition_clue}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ArtifactSection>
  );
}

// Strip surrounding $$ or $ delimiters that the LLM may have added,
// then render the bare LaTeX expression directly.
function stripMathDelimiters(expr) {
  if (!expr) return "";
  const s = expr.trim();
  if (s.startsWith("$$") && s.endsWith("$$")) return s.slice(2, -2).trim();
  if (s.startsWith("$") && s.endsWith("$")) return s.slice(1, -1).trim();
  return s;
}

function FormulaBoardArtifact({ data }) {
  const formulas = data?.formulas || [];
  return (
    <ArtifactSection
      eyebrow="Equations"
      title="Formula board"
      description="Key equations and update rules extracted from the summary for quick revision."
    >
      <ul className="space-y-4">
        {formulas.map((f, i) => (
          <li key={i} className="rounded-2xl border border-[#95ff00]/15 bg-black/25 p-4">
            {/* Name may be plain text or contain inline math — use parser */}
            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-pink-300/90">
              {parseAndRenderMath(f.name)}
            </div>
            {/* Formula is ALWAYS a LaTeX expression — render directly as display math */}
            <div className="rounded-xl border border-[#95ff00]/15 bg-slate-950/70 px-4 py-3 text-cyan-100">
              <MathRenderer content={stripMathDelimiters(f.formula)} block={true} />
            </div>
            {f.meaning && (
              <div className="mt-3 text-sm leading-6 text-slate-300">
                {parseAndRenderMath(f.meaning)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </ArtifactSection>
  );
}

function ConceptGraphArtifact({ data }) {
  const nodes = data?.nodes || [];
  const edges = data?.edges || [];
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n.label]));
  const [root, ...relatedNodes] = nodes;
  return (
    <ArtifactSection
      eyebrow="Connections"
      title="Concept map"
      description="The root idea is placed first, followed by the connected concepts and their relationships."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-3xl border border-[#95ff00]/15 bg-black/25 p-5">
          {root && (
            <div className="mb-5 flex justify-center">
              <div className="rounded-full border border-[#95ff00]/30 bg-[#95ff00]/10 px-6 py-3 text-center text-base font-semibold text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
                {root.label}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {relatedNodes.map((node) => (
              <div key={node.id} className="rounded-2xl border border-slate-700/70 bg-slate-900/85 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/15 text-xs font-bold text-pink-300">
                    {node.label.slice(0, 2).toUpperCase()}
                  </span>
                  <p className="text-sm font-medium text-white">{node.label}</p>
                </div>
                <div className="text-xs leading-5 text-slate-400">
                  Connected to {edges.filter((edge) => edge.from === node.id || edge.to === node.id).length} relationship
                  {edges.filter((edge) => edge.from === node.id || edge.to === node.id).length === 1 ? "" : "s"}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[#95ff00]/15 bg-black/25 p-5">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Relationship paths</h4>
          <div className="space-y-3">
            {edges.map((e, i) => (
              <div key={i} className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 text-sm text-slate-200">
                <span className="font-medium text-cyan-200">{nodeMap[e.from] || e.from}</span>
                <span className="mx-3 text-pink-300">→</span>
                <span className="font-medium text-emerald-200">{nodeMap[e.to] || e.to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ArtifactSection>
  );
}

function ExamRevisionArtifact({ data }) {
  const points = data?.points || [];
  return (
    <ArtifactSection
      eyebrow="Revision"
      title="Exam-ready checklist"
      description="A short list of what a student should retain after reading the summary."
    >
      <ul className="grid gap-3 md:grid-cols-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl border border-[#95ff00]/15 bg-black/25 p-4 text-sm text-slate-200">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-xs font-bold text-pink-300">
              {i + 1}
            </span>
            <span className="leading-6">{parseAndRenderMath(p)}</span>
          </li>
        ))}
      </ul>
    </ArtifactSection>
  );
}

export function ArtifactRenderer({ artifacts }) {
  if (!artifacts || artifacts.length === 0) return null;

  return (
    <div className="space-y-6">
      {artifacts.map(({ type, data }, index) => {
        switch (type) {
          case "mermaid":
          case "mermaid_diagram":
          case "flowchart":
          case "flowchart_diagram":
          case "flow_diagram":
          case "sequence_diagram":
          case "sequencediagram":
          case "state_diagram":
          case "statediagram":
          case "statediagram-v2":
          case "class_diagram":
          case "classdiagram":
          case "er_diagram":
          case "erdiagram":
          case "gantt":
          case "pie_chart":
          case "pie":
          case "mindmap":
          case "graph":
            return (
              <MermaidBlock
                key={index}
                code={data?.code}
                title={data?.title}
                index={index}
              />
            );
          case "timeline":
            return <TimelineArtifact key={index} data={data} />;
          case "learning_journey":
            return <LearningJourneyArtifact key={index} data={data} />;
          case "misconception_matrix":
            return <MisconceptionMatrixArtifact key={index} data={data} />;
          case "formula_board":
            return <FormulaBoardArtifact key={index} data={data} />;
          case "concept_graph":
            return <ConceptGraphArtifact key={index} data={data} />;
          case "exam_revision":
            return <ExamRevisionArtifact key={index} data={data} />;
          default:
            return (
              <div key={index} className="rounded-xl bg-gray-800/30 border border-gray-600/50 p-4 text-gray-400 text-sm">
                Unknown artifact type: {type}
              </div>
            );
        }
      })}
    </div>
  );
}
