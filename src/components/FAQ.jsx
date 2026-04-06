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
    <div className="py-32 bg-[#0c0e11] relative overflow-hidden">
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
            className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-2 mb-6"
          >
            <motion.span
              className="h-2 w-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-primary text-sm font-medium">Got Questions?</span>
          </motion.div>

          <motion.h2
            className="font-heading text-4xl md:text-6xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Frequently Asked{' '}
            <span className="text-primary">Questions</span>
          </motion.h2>

          <motion.p
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Everything you need to know about{' '}
            <span className="text-white font-medium">QuickLearnAI</span>
          </motion.p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          className="space-y-3"
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
                "transition-all duration-300",
                openIndex === index
                  ? "border-primary/30 bg-[#1a1d22]"
                  : "border-white/[0.08] bg-[#1a1d22] hover:border-white/20"
              ].join(" ")}
              whileHover={{ scale: 1.01 }}
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-300 hover:bg-white/[0.02]"
                whileTap={{ scale: 0.99 }}
              >
                <motion.span
                  className="text-white font-medium text-base pr-4"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {faq.question}
                </motion.span>

                <motion.div
                  animate={{
                    rotate: openIndex === index ? 45 : 0,
                    scale: openIndex === index ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex-shrink-0 transition-all duration-300"
                  whileHover={{ scale: 1.2 }}
                >
                  <Plus className="w-5 h-5 text-primary" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.4, ease: "easeOut" },
                      opacity: { duration: 0.3, delay: 0.1 }
                    }}
                    className="overflow-hidden border-t border-white/[0.06]"
                  >
                    <motion.div
                      className="px-6 py-5 bg-primary/[0.03]"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <motion.p
                        className="text-gray-400 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        {faq.answer}
                      </motion.p>
                    </motion.div>
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
            className="p-8 rounded-3xl bg-[#1a1d22] border border-white/[0.08] transition-all duration-300"
            whileHover={{ scale: 1.02, borderColor: "rgba(149,255,0,0.2)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.h3
              className="text-xl font-semibold font-heading text-white mb-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Still have questions?
            </motion.h3>
            <motion.p
              className="text-gray-400 mb-6"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </motion.p>
            <motion.a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=iamquicklearn.ai@gmail.com&su=Support%20Request%20-%20QuickLearn%20AI&body=Hi%20QuickLearn%20AI%20Support%20Team,%0D%0A%0D%0AI%20need%20assistance%20with:%0D%0A%0D%0A[Please%20describe%20your%20issue%20here]%0D%0A%0D%0AThank%20you!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-primary text-black text-sm font-semibold rounded-full transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(149,255,0,0.25)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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