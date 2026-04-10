import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

function Navbar({ onSignUpClick, onLoginClick }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const teacherLinks = [
    { to: "/chatbot", label: "WhisperDoc" },
    { to: "/create-quiz", label: "SmartQuiz" },
    { to: "/teacher-dashboard", label: "Home" },
    { to: "/question-bank", label: "QuestionBank" },
    { to: "/aboutus", label: "AboutUs" },
  ];

  const studentLinks = [
    { to: "/chatbot", label: "WhisperDoc" },
    { to: "/quiz", label: "SmartQuiz" },
    { to: "/", label: "Home" },
    { to: "/question-bank", label: "QuestionBank" },
    { to: "/aboutus", label: "AboutUs" },
  ];

  useEffect(() => {
    // Check if user is logged in by looking for user-info in localStorage
    const checkAuthState = () => {
      const userInfo = JSON.parse(localStorage.getItem("user-info"));
      setIsLoggedIn(!!userInfo);
      setUserType(userInfo?.role || null);
    };

    checkAuthState();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuthState();
    };

    // Listen for custom auth events
    window.addEventListener("authStateChanged", handleAuthChange);

    // Listen for storage changes (for cross-tab synchronization)
    window.addEventListener("storage", (e) => {
      if (e.key === "user-info") {
        checkAuthState();
      }
    });

    // Scroll effect for navbar with hide/show behavior
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Set scrolled state for styling
      setIsScrolled(currentScrollY > 20);

      // Hide/show navbar logic
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or near the top
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setShowNavbar(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    // Simply clear localStorage and update state
    localStorage.removeItem("user-info");
    setIsLoggedIn(false);
    setUserType(null);
    navigate("/");
    // Force a page reload to clear any remaining state
    window.location.reload();
  };

  const avatar = localStorage.getItem("user-info")
    ? JSON.parse(localStorage.getItem("user-info")).avatar
    : "https://github.com/shadcn.png";

  // Determine which links to show
  const navigationLinks = userType === "teacher" ? teacherLinks : studentLinks;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: showNavbar ? 0 : -100,
        opacity: showNavbar ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-8 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          animate={{
            backgroundColor: isScrolled
              ? "rgba(0, 0, 0, 0.8)"
              : "rgba(0, 0, 0, 0.4)",
            borderColor: isScrolled
              ? "rgba(0, 255, 157, 0.3)"
              : "rgba(255, 255, 255, 0.05)",
            scale: isScrolled ? 0.98 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="backdrop-blur-md rounded-full px-6 border shadow-lg shadow-[var(--primary)]/10"
        >
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="flex items-center">
                <motion.img
                  src="/logo1.png"
                  alt="QuickLearnAI Logo"
                  className="h-7 w-auto"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={link.to}
                    className="relative text-l font-medium text-foreground/90 hover:text-[var(--primary)] transition-colors duration-300 group"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.label}
                    </motion.span>
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] rounded-full"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{ originX: 0.5 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <motion.button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.button>
              </div>

              <div className="hidden md:flex items-center space-x-3">
              <motion.button
                onClick={toggleTheme}
                className="relative p-2.5 rounded-full bg-surface/10 border border-border/10 hover:bg-surface/20 text-foreground/80 hover:text-foreground transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'dark' ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <AnimatePresence mode="wait">
                  {!isLoggedIn ? (
                    <motion.div
                      key="auth-buttons"
                      className="flex items-center space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        onClick={onSignUpClick}
                        className="px-6 py-1 bg-gradient-to-r from-[#01311F] to-[#039760] text-l font-medium rounded-full border-2 border-primary text-foreground hover:bg-gradient-to-l hover:from-[#01311F] hover:to-[#039760] transition-all duration-300 relative overflow-hidden group"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10">Sign Up</span>
                      </motion.button>

                      <motion.button
                        onClick={onLoginClick}
                        className="px-6 py-1 bg-gradient-to-r from-[#01311F] to-[#039760] text-l font-medium rounded-full border-2 border-primary text-foreground hover:bg-gradient-to-l hover:from-[#01311F] hover:to-[#039760] transition-all duration-300 relative overflow-hidden group"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10">Sign In</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="user-section"
                      className="flex items-center space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-[var(--primary)]/10 text-l font-medium rounded-full border border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/20 hover:border-[var(--primary)]/50 transition-all duration-300 relative overflow-hidden group"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 0 15px rgba(0, 255, 157, 0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-[var(--primary)]/10"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10">Logout</span>
                      </motion.button>

                      <Link
                        to={
                          userType === "admin"
                            ? "/admin"
                            : userType === "teacher"
                              ? "/teacher-dashboard"
                              : "/dashboard"
                        }
                      >
                        <motion.div
                          className="relative"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--primary)]/30 to-[var(--primary)]/30 blur-md"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          <Avatar className="ring-2 ring-[var(--primary)]/30 hover:ring-[var(--primary)] ring-offset-2 ring-offset-black/50 transition-all duration-300 relative z-10">
                            <AvatarImage
                              src={avatar}
                              alt="Profile"
                              className="hover:brightness-110 transition-all duration-300"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700">
                              {userType === "admin"
                                ? "A"
                                : userType === "teacher"
                                  ? "T"
                                  : "S"}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden mt-2 overflow-hidden"
            >
              <motion.div
                className="bg-background/90 backdrop-blur-md rounded-2xl border border-[var(--primary)]/30 mx-4 p-4 shadow-lg shadow-[var(--primary)]/10"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {/* Mobile Navigation Links */}
                <div className="space-y-3 mb-4">
                  {isLoggedIn &&
                    navigationLinks.map((link, index) => (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 text-foreground/90 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all duration-300 font-medium"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                </div>

                {/* Mobile Auth Section */}
                <div className="border-t border-border/10 pt-4">
                  {!isLoggedIn ? (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <motion.button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-surface/10 border border-border/20 text-foreground font-medium rounded-lg hover:bg-surface/20 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {theme === 'dark' ? (
                          <>
                            <Sun className="w-5 h-5" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-5 h-5" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </motion.button>
                      <button
                        onClick={() => {
                          onSignUpClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#01311F] to-[#039760] text-foreground font-medium rounded-lg border-2 border-primary hover:bg-gradient-to-l hover:from-[#01311F] hover:to-[#039760] transition-all duration-300"
                      >
                        Sign Up
                      </button>
                      <button
                        onClick={() => {
                          onLoginClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#01311F] to-[#039760] text-foreground font-medium rounded-lg border-2 border-primary hover:bg-gradient-to-l hover:from-[#01311F] hover:to-[#039760] transition-all duration-300"
                      >
                        Sign In
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Link
                        to={
                          userType === "admin"
                            ? "/admin"
                            : userType === "teacher"
                              ? "/teacher-dashboard"
                              : "/dashboard"
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 p-3 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/30"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={avatar} alt="Profile" />
                          <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-xs">
                            {userType === "admin"
                              ? "A"
                              : userType === "teacher"
                                ? "T"
                                : "S"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[var(--primary)] font-medium">
                          Dashboard
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 bg-red-500/10 text-red-400 font-medium rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-all duration-300"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

Navbar.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
  onSignUpClick: PropTypes.func.isRequired,
};

export default Navbar;
