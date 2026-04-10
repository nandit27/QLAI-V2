import { ContainerScroll } from "./ui/ContainerScrollAnimation";
import dashboardImg from '../assets/dashboard.png';

export default function ContainerScrollDemo() {
  return (
    <div className="w-full overflow-hidden bg-transparent pt-12 md:pt-0">
      <ContainerScroll
        titleComponent={
          <div className="space-y-4 mb-4 md:mb-8">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 bg-[var(--primary-muted)] px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm">
                Platform Overview
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-[var(--foreground)] tracking-tight">
              Everything you need to <br/>
              <span className="text-[var(--primary)]">learn smarter</span>
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed font-medium">
              QuickLearn AI brings every tool a modern student and educator
              needs — in one seamless, AI-first platform.
            </p>
          </div>
        }
      >
        <div 
          className="w-full h-full rounded-[2rem] bg-[var(--surface-container-low)] p-1.5 md:p-2 border border-[var(--border)] shadow-card transition-colors duration-300"
        >
          <div className="w-full h-full rounded-[calc(2rem-0.375rem)] bg-[var(--surface)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[var(--border-variant)] relative group">
            
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-variant)] border-b border-[var(--border)] absolute top-0 w-full z-10 transition-colors duration-300">
              <span className="w-3 h-3 rounded-full bg-red-400/90 shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-green-400/90 shadow-sm" />
              <div className="ml-4 flex-1 max-w-sm rounded-md flex items-center px-4 py-1.5 text-xs font-semibold font-mono text-[var(--text-muted)] bg-[var(--background)] border border-[var(--border)]">
                app.quicklearnai.com/dashboard
              </div>
            </div>

            {/* Dashboard Screenshot Image */}
            <div className="relative w-full h-full pt-10 bg-[var(--surface-container-lowest)]">
              <img 
                src={dashboardImg} 
                className="w-full h-full object-cover object-top"
                alt="Dashboard Overview"
              />
              
              {/* Subtle overlay gradient to blend bottom edge if needed */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--surface)] to-transparent opacity-10 pointer-events-none" />
            </div>
            
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
