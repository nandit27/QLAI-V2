/**
 * ContainerScrollDemo
 * -------------------
 * A ready-to-use showcase of the Aceternity Container Scroll Animation,
 * themed to match this project's dark green aesthetic.
 *
 * Drop this anywhere in the page — the animation triggers purely on scroll,
 * no additional context / provider required.
 *
 * Usage in App.jsx Home():
 *   import ContainerScrollDemo from "./components/ContainerScrollDemo";
 *   ...
 *   <section data-section-id="scroll-demo" className="transform-gpu">
 *     <ContainerScrollDemo />
 *   </section>
 */

import { ContainerScroll } from "./ui/ContainerScrollAnimation";

const FEATURES = [
  { icon: "🧠", label: "AI Quiz Generation",  desc: "Instant, personalised quizzes from any topic." },
  { icon: "📊", label: "Live Analytics",       desc: "Real-time student performance dashboards." },
  { icon: "💬", label: "AI Chat Tutor",        desc: "24/7 doubt resolution powered by LLMs." },
  { icon: "🗺️", label: "Mind Maps",             desc: "Visual knowledge graphs generated in seconds." },
  { icon: "📄", label: "Doc Chat",              desc: "Upload PDFs and talk to your documents." },
  { icon: "🎯", label: "Recommendations",       desc: "Hyper-personalised learning paths." },
];

export default function ContainerScrollDemo() {
  return (
    <div className="w-full overflow-hidden bg-black">
      <ContainerScroll
        titleComponent={
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-[#00FF9D] font-semibold">
              Platform Overview
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-[#00FF9D] to-[#1BFFA8] bg-clip-text text-transparent">
                learn smarter
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              QuickLearn AI brings every tool a modern student and educator
              needs — in one seamless, AI-first platform.
            </p>
          </div>
        }
      >
        {/*
          The "card" content — displayed as a mock product screenshot / UI preview.
          Keep overflow-hidden here so the rounded corners clip children correctly
          during the 3-D rotation.
        */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#00FF9D]/10 bg-gradient-to-br from-gray-900 via-black to-gray-950">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/80 border-b border-white/5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="ml-4 flex-1 bg-black/40 rounded-full px-4 py-1 text-xs text-gray-500">
              app.quicklearnai.com/dashboard
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6 md:p-10">
            {/* Greeting bar */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-400 text-sm">Good morning 👋</p>
                <h3 className="text-white text-xl md:text-2xl font-bold">
                  Welcome back, Student
                </h3>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs font-medium">
                  Pro Plan
                </div>
              </div>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURES.map(({ icon, label, desc }) => (
                <div
                  key={label}
                  className="group rounded-xl p-4 bg-white/[0.03] border border-white/[0.07]
                             hover:border-[#00FF9D]/30 hover:bg-[#00FF9D]/5
                             transition-all duration-300 cursor-pointer"
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-white text-sm font-semibold mb-1">{label}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: "Quizzes Taken",  value: "128" },
                { label: "Avg. Score",     value: "87%" },
                { label: "Study Streak",   value: "14d" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-4 bg-gradient-to-br from-[#00FF9D]/5 to-transparent
                             border border-[#00FF9D]/10 text-center"
                >
                  <p className="text-2xl font-bold text-[#00FF9D]">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
