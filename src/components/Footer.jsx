import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  const links = {
    "Platform": [
      { label: "Quiz Generator", path: "/quiz" },
      { label: "Doubt Resolution", path: "/doubt/create" },
      { label: "Mind Maps", path: "/mindmap" },
      { label: "YouTube Learning", path: "/chatbot" },
      { label: "Recommendations", path: "/recommendations" }
    ],
    "For Teachers": [
      { label: "Join as Teacher", path: "/signup" },
      { label: "Create Quiz", path: "/create-quiz" },
      { label: "Dashboard", path: "/teacher-dashboard" },
      { label: "Teaching Guide", path: "/guide" }
    ],
    "Resources": [
      { label: "Help Center", path: "/help" },
      { label: "Blog", path: "/blog" },
      { label: "Community", path: "/community" },
      { label: "API Documentation", path: "/docs" }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const socialVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "backOut" } }
  };

  return (
    <footer className="bg-transparent border-t border-[var(--border)] relative overflow-hidden">
      {/* Subtle ambient glow — mapped dynamically */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[var(--primary-muted)] blur-3xl rounded-full opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="py-14"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand Section */}
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {/* Logo dot + wordmark */}
                <div className="w-8 h-8 rounded-full bg-[var(--primary-muted)] flex items-center justify-center border border-[var(--primary)]/20">
                  <div className="w-4 h-4 rounded-full bg-[var(--primary)]" />
                </div>
                <span className="text-xl font-bold font-sans tracking-tight text-[var(--foreground)]">
                  QuickLearnAI
                </span>
              </motion.div>

              <p className="text-[var(--text-muted)] text-sm leading-relaxed font-medium">
                Empowering education through AI and expert teachers. Making learning accessible, interactive, and effective.
              </p>

              {/* Social Links */}
              <motion.div className="flex space-x-3" variants={containerVariants}>
                {[
                  { Icon: Github, href: "#" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Linkedin, href: "#" },
                  { Icon: Instagram, href: "#" }
                ].map(({ Icon, href }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    variants={socialVariants}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="w-9 h-9 rounded-full bg-[var(--surface-container-low)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] hover:border-[var(--primary)]/30 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Link Sections */}
            {Object.entries(links).map(([category, items], categoryIndex) => (
              <motion.div key={category} variants={itemVariants}>
                <h4 className="text-[var(--foreground)] font-semibold text-sm uppercase tracking-widest mb-5">
                  {category}
                  <div className="mt-2 h-px w-8 bg-[var(--primary)]/40 rounded-full" />
                </h4>
                <ul className="space-y-3">
                  {items.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm font-medium transition-all duration-300 inline-flex items-center gap-1 group font-sans"
                      >
                        <motion.span
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                          className="inline-block"
                        >
                          {item.label}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-[var(--border)] py-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--text-muted)] font-medium">
              © {new Date().getFullYear()} QuickLearnAI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {[
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms of Service", path: "/terms" },
                { label: "Cookie Policy", path: "/cookies" }
              ].map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] font-medium transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}

export default Footer;