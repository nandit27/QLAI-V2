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
    <footer className="bg-[#0c0e11] border-t border-white/[0.06] relative overflow-hidden">
      {/* Subtle ambient glow — no moving gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/[0.03] blur-3xl rounded-full" />
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
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <span className="text-xl font-bold font-heading text-white">
                  QuickLearnAI
                </span>
              </motion.div>

              <p className="text-gray-400 text-sm leading-relaxed">
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
                    className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Link Sections */}
            {Object.entries(links).map(([category, items], categoryIndex) => (
              <motion.div key={category} variants={itemVariants}>
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 font-heading">
                  {category}
                  <div className="mt-2 h-px w-8 bg-primary/40 rounded-full" />
                </h4>
                <ul className="space-y-3">
                  {items.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="text-gray-400 hover:text-primary text-sm transition-all duration-300 inline-flex items-center gap-1 group"
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
          className="border-t border-white/[0.06] py-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
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
                  className="text-sm text-gray-500 hover:text-primary transition-all duration-300"
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