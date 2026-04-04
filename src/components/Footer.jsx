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
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const socialVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  return (
    <footer className="bg-black border-t border-white/5 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, #00FF9D 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 50%, #00FF9D 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 50%, #00FF9D 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="py-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full bg-[#00FF9D]/20 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(0, 255, 157, 0.4)",
                      "0 0 0 10px rgba(0, 255, 157, 0)",
                      "0 0 0 0 rgba(0, 255, 157, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="w-6 h-6 rounded-full bg-[#00FF9D]"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                <motion.span
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#00FF9D]"
                  whileHover={{
                    background: "linear-gradient(45deg, #00FF9D, #1BFFA8, #00FF9D)"
                  }}
                >
                  QuickLearnAI
                </motion.span>
              </motion.div>
              
              <motion.p
                className="text-gray-400 text-sm"
                variants={itemVariants}
              >
                Empowering education through AI and expert teachers. Making learning accessible, interactive, and effective.
              </motion.p>
              
              {/* Social Links */}
              <motion.div
                className="flex space-x-4"
                variants={containerVariants}
              >
                {[
                  { Icon: Github, href: "#", delay: 0 },
                  { Icon: Twitter, href: "#", delay: 0.1 },
                  { Icon: Linkedin, href: "#", delay: 0.2 },
                  { Icon: Instagram, href: "#", delay: 0.3 }
                ].map(({ Icon, href, delay }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    variants={socialVariants}
                    whileHover={{
                      scale: 1.2,
                      rotate: 10,
                      backgroundColor: "rgba(0, 255, 157, 0.1)",
                      borderColor: "rgba(0, 255, 157, 0.5)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-gray-400 hover:text-[#00FF9D] hover:border-[#00FF9D]/30 transition-all duration-300 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#00FF9D]/10 to-[#1BFFA8]/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <Icon className="w-5 h-5 relative z-10" />
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Links Sections */}
            {Object.entries(links).map(([category, items], categoryIndex) => (
              <motion.div
                key={category}
                variants={itemVariants}
              >
                <motion.h4
                  className="text-white font-semibold mb-6 relative"
                  whileHover={{ color: "#00FF9D" }}
                  transition={{ duration: 0.3 }}
                >
                  {category}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#00FF9D] to-transparent"
                    initial={{ width: 0 }}
                    whileInView={{ width: "60%" }}
                    transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                  />
                </motion.h4>
                <motion.ul
                  className="space-y-4"
                  variants={containerVariants}
                >
                  {items.map((item, index) => (
                    <motion.li
                      key={index}
                      variants={{
                        hidden: { x: -20, opacity: 0 },
                        visible: {
                          x: 0,
                          opacity: 1,
                          transition: {
                            duration: 0.4,
                            delay: index * 0.1
                          }
                        }
                      }}
                    >
                      <Link
                        to={item.path}
                        className="text-gray-400 hover:text-[#00FF9D] transition-all duration-300 text-sm relative group inline-block"
                      >
                        <motion.span
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                          className="inline-block"
                        >
                          {item.label}
                        </motion.span>
                        <motion.div
                          className="absolute -bottom-0.5 left-0 h-px bg-[#00FF9D]"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-white/5 py-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div
              className="text-sm text-gray-400"
              whileHover={{ color: "#00FF9D" }}
              transition={{ duration: 0.3 }}
            >
              © {new Date().getFullYear()} QuickLearnAI. All rights reserved.
            </motion.div>
            <motion.div
              className="flex space-x-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms of Service", path: "/terms" },
                { label: "Cookie Policy", path: "/cookies" }
              ].map((link, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }
                  }}
                >
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-[#00FF9D] transition-all duration-300 relative group"
                  >
                    <motion.span
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {link.label}
                    </motion.span>
                    <motion.div
                      className="absolute -bottom-0.5 left-0 h-px bg-[#00FF9D]"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;