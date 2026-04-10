import { Plus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is QuickLearnAI?",
      answer: "QuickLearnAI is an AI-powered educational platform that combines expert teacher support with advanced AI technology. We offer features like instant doubt resolution, smart quiz generation, interactive mind maps, and personalized learning assistance."
    },
    {
      question: "How does the doubt resolution system work?",
      answer: "When you submit a doubt, our platform instantly matches you with qualified teachers in that subject area. If no teachers are immediately available, our AI system provides instant assistance. You can submit doubts as text or upload images of your questions."
    },
    {
      question: "Can I use QuickLearnAI with YouTube videos?",
      answer: "Yes! Our YouTube Learning Assistant allows you to chat with AI about educational videos, get instant summaries, and clarify concepts while watching. Simply paste the video URL and start learning more effectively."
    },
    {
      question: "How does the Quiz Generation feature work?",
      answer: "You can generate quizzes in two ways: by providing a topic or concept for the AI to create questions about, or by sharing a YouTube video URL. The system will create personalized questions with varying difficulty levels to test your understanding."
    },
    {
      question: "Are the teachers on the platform verified?",
      answer: "Yes, all teachers undergo thorough verification and background checks. We verify their qualifications, expertise, and teaching experience to ensure high-quality educational support."
    },
    {
      question: "What are Mind Maps and how do they help?",
      answer: "Our AI-powered Mind Maps feature helps visualize complex topics by creating interactive concept maps. This helps in better understanding relationships between different concepts and improves information retention."
    },
    {
      question: "Is QuickLearnAI free to use?",
      answer: "QuickLearnAI offers both free and premium features. Basic features like AI assistance and quiz generation are available to all users, while advanced features like teacher consultation and unlimited doubt resolution are part of our premium plans."
    },
    {
      question: "How secure is my learning data?",
      answer: "We prioritize your data security with end-to-end encryption, GDPR compliance, and strict privacy protocols. All your learning interactions, chat histories, and personal information are fully protected."
    }
  ];

  return (
    <div className="py-32 relative overflow-hidden bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-[var(--primary-muted)] border border-[var(--primary)]/20 rounded-full px-6 py-2 mb-6"
          >
            <motion.span
              className="h-2 w-2 bg-[var(--primary)] rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[var(--primary)] text-sm font-semibold tracking-wide">Got Questions?</span>
          </motion.div>

          <motion.h2
            className="font-sans text-5xl md:text-6xl font-bold mb-6 tracking-tight text-[var(--foreground)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Frequently Asked{' '}
            <span className="text-[var(--primary)]">Questions</span>
          </motion.h2>

          <motion.p
            className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Everything you need to know about{' '}
            <span className="text-[var(--foreground)] font-semibold">QuickLearnAI</span>
          </motion.p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + (index * 0.08), ease: "easeOut" }}
              viewport={{ once: true }}
              className={[
                "rounded-2xl border overflow-hidden",
                "transition-all duration-300 shadow-sm",
                openIndex === index
                  ? "border-[var(--primary)] bg-[var(--surface)]"
                  : "border-[var(--border)] bg-[var(--surface-container-low)] hover:bg-[var(--surface-variant)] hover:border-[var(--primary)]/30"
              ].join(" ")}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-300 group"
              >
                <span
                  className="text-[var(--foreground)] font-semibold text-lg md:text-base pr-4 group-hover:translate-x-1 transition-transform duration-300"
                >
                  {faq.question}
                </span>

                <motion.div
                  animate={{
                    rotate: openIndex === index ? 45 : 0,
                    scale: openIndex === index ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3, ease: 'backOut' }}
                  className="flex-shrink-0"
                >
                  <Plus className="w-5 h-5 text-[var(--primary)]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.4, ease: "easeInOut" },
                      opacity: { duration: 0.3, delay: 0.1 }
                    }}
                    className="overflow-hidden border-t border-[var(--border-variant)]"
                  >
                    <div
                      className="px-6 pb-6 pt-4 bg-[var(--surface-container-lowest)]"
                    >
                      <p
                        className="text-[var(--text-secondary)] leading-relaxed text-base"
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center max-w-xl mx-auto"
        >
          <motion.div
            className="p-8 rounded-[2rem] bg-[var(--surface-container-low)] border border-[var(--border)] transition-all duration-300 hover:border-[var(--primary)] group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <h3
              className="text-2xl font-bold text-[var(--foreground)] mb-3 tracking-tight group-hover:-translate-y-1 transition-transform duration-300"
            >
              Still have questions?
            </h3>
            <p
              className="text-[var(--text-muted)] mb-8 text-base font-medium"
            >
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <motion.a
              href="mailto:iamquicklearn.ai@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-base font-semibold rounded-full shadow-[0_4px_20px_rgba(var(--highlight-rgb),_0.3)] transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
              whileTap={{ scale: 0.98 }}
            >
              Contact Support
            </motion.a>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

export default FAQ;