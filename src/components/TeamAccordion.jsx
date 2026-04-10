import React from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';

import rajuImg from '../assets/raju.png';
import bhavyaImg from '../assets/bhavya.png';
import nanditImg from '../assets/nandit.png';
import jugalImg from '../assets/jugal.png';

const teamMembers = [
  {
    id: '1',
    name: "Raj",
    role: "AI Visionary & Architect",
    avatar: rajuImg,
    quote: "Dreaming in neural networks.",
    rotation: "md:-rotate-[5deg]",
    offset: "md:-translate-y-8",
    pinColor: "#ef4444", // red
    socials: {
      linkedin: "https://www.linkedin.com/in/raj-shah-r2237/",
      github: "https://github.com/raj2237",
      instagram: "https://www.instagram.com/_.raj_22",
    },
  },
  {
    id: '2',
    name: "Bhavya",
    role: "The Backend Buster",
    avatar: bhavyaImg,
    quote: "I drop tables, not beats.",
    rotation: "md:rotate-[2deg]",
    offset: "md:translate-y-6",
    pinColor: "#10b981", // green
    socials: {
      linkedin: "https://www.linkedin.com/in/bhavya-prajapati1/",
      github: "https://github.com/bhavyagp",
      instagram: "https://instagram.com/bhavya5.exe",
    },
  },
  {
    id: '3',
    name: "Nandit",
    role: "The Frontend Fnatic",
    avatar: nanditImg,
    quote: "Pixel-perfect or it doesn't ship.",
    rotation: "md:-rotate-[2deg]",
    offset: "md:-translate-y-4",
    pinColor: "#ef4444", // red
    socials: {
      linkedin: "https://www.linkedin.com/in/nandit-kalaria-06281631a/",
      github: "https://github.com/nandit27",
      instagram: "https://www.instagram.com/nanditz_27",
    },
  },
  {
    id: '4',
    name: "Jugal",
    role: "The Creative Engine",
    avatar: jugalImg,
    quote: "Making things look expensive.",
    rotation: "md:rotate-[4deg]",
    offset: "md:translate-y-8",
    pinColor: "#10b981", // green
    socials: {
      linkedin: "https://www.linkedin.com/in/jugal-salaskar-6622442a7",
      github: "#",
      instagram: "https://www.instagram.com/jugal21.jpg",
    },
  },
];

export default function TeamAccordion() {
  return (
    <section className="relative w-full py-32 overflow-hidden flex flex-col items-center bg-[var(--background)] transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        
        .font-handwriting {
          font-family: 'Caveat', cursive;
        }
      `}</style>
      
      {/* Subtle paper grain texture */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="relative z-10 text-center mb-24 px-4 flex flex-col items-center w-full">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-container)] px-5 py-2 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--foreground)] mt-[1px]">
            Meet The Team
          </span>
        </div>
        
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans text-[var(--foreground)] tracking-tight mb-6 transition-colors duration-300">
          The Minds Behind QuickLearn AI
        </h2>
        
        {/* Subtext */}
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg md:text-xl font-light tracking-wide transition-colors duration-300">
          A passionate group of engineers, designers, and innovators committed to revolutionizing education through AI.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 md:gap-6 lg:gap-10 perspective-1000">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className={`group relative flex flex-col w-72 md:w-[260px] lg:w-[290px] bg-[#fdfcf9] p-3 pb-0 lg:p-4 lg:pb-0 shadow-[0_20px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]
                         transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex-shrink-0 cursor-pointer
                         ${member.rotation} ${member.offset}
                         md:hover:rotate-0 hover:scale-[1.04] hover:z-20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)]
                         before:absolute before:inset-0 before:ring-1 before:ring-black/5`}
            >
              {/* Top Pin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full shadow-md z-20 overflow-hidden" style={{ backgroundColor: member.pinColor }}>
                <div className="absolute top-[2px] left-[2px] w-1.5 h-1.5 md:w-2 md:h-2 bg-white/60 rounded-full"></div>
                <div className="absolute inset-0 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)] rounded-full pointer-events-none"></div>
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-black/40 -z-10 blur-[1px]"></div>

              {/* Photo Area */}
              <div className="relative w-full aspect-[4/5] bg-transparent overflow-hidden shadow-inner border border-black/5">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
              </div>

              {/* Bottom Paper Strip container */}
              <div className="relative w-full bg-[#fdfcf9] z-10 h-[135px] lg:h-[145px] overflow-hidden rounded-b-sm">
                <div className="absolute top-0 left-0 w-full flex flex-col items-center transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-[45px] lg:group-hover:-translate-y-[52px] pt-4 lg:pt-5">
                   <h3 className="font-handwriting text-[2.5rem] lg:text-[2.75rem] leading-none text-neutral-800 font-bold -rotate-2 mb-1 lg:mb-1.5">
                     {member.name}
                   </h3>
                   <span className="text-[9px] lg:text-[10px] text-neutral-500 tracking-[0.25em] uppercase font-bold mb-3 lg:mb-4">
                     {member.role}
                   </span>
                   
                   {/* Socials */}
                   <div className="flex gap-4 items-center mb-6 lg:mb-8">
                      <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#0a66c2] transition-colors"><Linkedin size={16} strokeWidth={2.5}/></a>
                      <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors"><Github size={16} strokeWidth={2.5}/></a>
                      <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#e1306c] transition-colors"><Instagram size={16} strokeWidth={2.5}/></a>
                   </div>

                   {/* Fun Fact */}
                   <div className="w-[85%] border-t border-neutral-200/80 pt-2 lg:pt-3 flex justify-center">
                      <p className="text-[11px] lg:text-xs font-editorial italic text-neutral-600 text-center tracking-wide line-clamp-1">
                        "{member.quote}"
                      </p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

