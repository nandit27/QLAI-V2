import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "QuickLearn AI completely changed how I study. The adaptive quizzes feel like they were made just for me.",
    image: "https://i.pravatar.cc/150?img=1",
    name: "Aarav Sharma",
    role: "Class 12 Student",
  },
  {
    text: "I used to spend hours making question papers. Now it takes 2 minutes. Absolute game changer.",
    image: "https://i.pravatar.cc/150?img=2",
    name: "Priya Mehta",
    role: "High School Teacher",
  },
  {
    text: "The AI tutor explains concepts better than most YouTube videos I've watched.",
    image: "https://i.pravatar.cc/150?img=3",
    name: "Rohan Patel",
    role: "JEE Aspirant",
  },
  {
    text: "My students' engagement doubled after I started using QuickLearn for assignments.",
    image: "https://i.pravatar.cc/150?img=4",
    name: "Sunita Rao",
    role: "College Lecturer",
  },
  {
    text: "The mind map feature is unreal. I can visualize an entire chapter in seconds.",
    image: "https://i.pravatar.cc/150?img=5",
    name: "Vikram Nair",
    role: "UPSC Aspirant",
  },
  {
    text: "Finally an ed-tech platform that actually uses AI intelligently, not just as a gimmick.",
    image: "https://i.pravatar.cc/150?img=6",
    name: "Ananya Iyer",
    role: "B.Tech Student",
  },
  {
    text: "I love how it tracks my weak topics and pushes more questions on those areas.",
    image: "https://i.pravatar.cc/150?img=7",
    name: "Karan Singh",
    role: "NEET Aspirant",
  },
  {
    text: "The quiz lobby feature makes group study sessions actually fun.",
    image: "https://i.pravatar.cc/150?img=8",
    name: "Meera Joshi",
    role: "MBA Student",
  },
  {
    text: "Best investment for exam prep. My scores improved significantly within 3 weeks.",
    image: "https://i.pravatar.cc/150?img=9",
    name: "Arjun Verma",
    role: "Class 10 Student",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = ({ testimonials, duration = 12, className = "" }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...Array(2)].map((_, idx) => (
          <React.Fragment key={idx}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <div
                key={i}
                className="p-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface-container-low)] shadow-sm max-w-xs w-full hover:border-[var(--primary)] hover:bg-[var(--surface-variant)] transition-all duration-300"
              >
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm font-medium">{text}</p>
                <div className="flex items-center gap-3 mt-6">
                  <img
                    src={image}
                    alt={name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full ring-2 ring-[var(--primary-muted)] object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--foreground)] text-sm leading-5">{name}</span>
                    <span className="text-xs text-[var(--text-muted)] leading-5 font-medium">{role}</span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="relative py-24 overflow-hidden bg-transparent">
      {/* Grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-variant) 1px, transparent 1px), linear-gradient(to right, var(--border-variant) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Heading */}
      <div className="relative z-10 text-center mb-20 px-4">
        <span className="inline-flex items-center rounded-full bg-[var(--primary-muted)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-6 border border-[var(--primary)]/20 shadow-sm">
          Testimonials
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-bold tracking-tight text-[var(--foreground)] mb-6">
          Loved by students & teachers
        </h2>
        <p className="mt-4 text-[var(--text-muted)] max-w-xl mx-auto text-lg font-medium">
          Thousands of learners trust QuickLearn AI to study smarter every day.
        </p>
      </div>

      {/* Columns */}
      <div className="relative z-10 flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <TestimonialsColumn testimonials={firstColumn} duration={14} />
        <TestimonialsColumn testimonials={secondColumn} duration={18} className="hidden md:flex" />
        <TestimonialsColumn testimonials={thirdColumn} duration={16} className="hidden lg:flex" />
      </div>
    </section>
  );
}
