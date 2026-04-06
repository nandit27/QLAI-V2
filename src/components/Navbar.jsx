import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, X } from "lucide-react";

function Navbar({ onSignUpClick, onLoginClick }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const navigate = useNavigate();

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
              ? "rgba(17, 19, 23, 0.85)"
              : "rgba(17, 19, 23, 0.5)",
            borderColor: isScrolled
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(255, 255, 255, 0.08)",
            scale: isScrolled ? 0.98 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="backdrop-blur-xl rounded-full px-6 border shadow-lg shadow-black/30"
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
                    className="relative text-l font-medium text-white/70 hover:text-primary transition-colors duration-300 group"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.label}
                    </motion.span>
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full"
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
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.button>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <AnimatePresence mode="wait">
                  {!isLoggedIn ? (
                    <motion.div
                      key="auth-buttons"
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        onClick={onSignUpClick}
                        className="px-6 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        Sign Up
                      </motion.button>

                      <motion.button
                        onClick={onLoginClick}
                        className="px-6 py-2 bg-primary text-black text-sm font-semibold rounded-full hover:bg-primary/90 transition-all duration-300"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 0 20px rgba(149, 255, 0, 0.35)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        Sign In
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
                        className="px-4 py-2 bg-white/5 text-sm font-medium rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        Logout
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
                            className="absolute inset-0 rounded-full bg-primary/20 blur-md"
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
                          <Avatar className="ring-2 ring-primary/30 hover:ring-primary ring-offset-2 ring-offset-black/50 transition-all duration-300 relative z-10">
                            <AvatarImage
                              src={avatar}
                              alt="Profile"
                              className="hover:brightness-110 transition-all duration-300"
                            />
                            <AvatarFallback className="bg-[#1a1d22] text-white">
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
                className="bg-[#111317]/95 backdrop-blur-xl rounded-2xl border border-white/10 mx-4 p-4 shadow-lg shadow-black/40"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {/* Mobile Navigation Links */}
                <div className="space-y-1 mb-4">
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
                          className="block px-4 py-3 text-white/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300 font-medium text-sm"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                </div>

                {/* Mobile Auth Section */}
                <div className="border-t border-white/10 pt-4">
                  {!isLoggedIn ? (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <button
                        onClick={() => {
                          onSignUpClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 bg-white/5 text-white font-medium rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm"
                      >
                        Sign Up
                      </button>
                      <button
                        onClick={() => {
                          onLoginClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 bg-primary text-black font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 text-sm"
                      >
                        Sign In
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="space-y-2"
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
                        className="flex items-center space-x-3 p-3 bg-primary/5 rounded-xl border border-primary/20"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={avatar} alt="Profile" />
                          <AvatarFallback className="bg-[#1a1d22] text-white text-xs">
                            {userType === "admin"
                              ? "A"
                              : userType === "teacher"
                                ? "T"
                                : "S"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-primary font-medium text-sm">
                          Dashboard
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 bg-red-500/10 text-red-400 font-medium rounded-full border border-red-500/20 hover:bg-red-500/15 transition-all duration-300 text-sm"
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
