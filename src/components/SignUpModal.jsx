import { useState, useEffect } from "react";
import Dialog from "./Dialog";
import { Tabs, TabContent } from "./Tabs";
import axios from "axios";
import PropTypes from "prop-types";

const CAROUSEL_IMAGES = [
  "/Quiz-based.jpeg",
  "/Flash-cards.jpeg",
  "/Flashy-Mind-Map.jpeg"
];

// carousel component for right side
const ImageCarousel = () => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "400px", overflow: "hidden", borderRadius: "0 14px 14px 0" }}>
      {CAROUSEL_IMAGES.map((src, i) => (
        <img key={i} src={src} alt={`slide-${i}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: i === current ? 1 : 0, transition: "opacity 0.7s ease" }}
        />
      ))}
      <div style={{ position: "absolute", bottom: "16px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "8px" }}>
        {CAROUSEL_IMAGES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            style={{ width: i === current ? "20px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: i === current ? "#1BFFA8" : "rgba(255,255,255,0.4)", border: "none", transition: "all 0.3s", cursor: "pointer", padding: 0 }}
          />
        ))}
      </div>
    </div>
  );
};

export const SignUpModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [activeTab, setActiveTab] = useState("student");
  const [hoveredTab, setHoveredTab] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.role = activeTab;

    // Store email for confirmation message
    setUserEmail(data.email);

    // Basic validation
    if (!data.email || !data.username) {
      setError("Email and username are required");
      setIsLoading(false);
      return;
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (data.password && data.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (data.username && data.username.length < 3) {
      setError("Username must be at least 3 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Show email sent confirmation for all roles
      setShowEmailSent(true);
      setIsLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      console.error("Registration error:", error);
      setIsLoading(false);
    }
  };

  //single helper — keeps button style logic clean
  const getTabStyle = (tab) =>
    activeTab === tab
      ? { backgroundColor: "#0C3D2A", border: "1px solid #1BFFA8", color: "#1BFFA8" }
      : { backgroundColor: "transparent", border: "1px solid #1BFFA8", color: hoveredTab === tab ? "#1BFFA8" : "white" };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="signup-modal-inner" style={{
        display: "flex",
        flexDirection: "row",
        width: "min(80vw, 900px)",
        maxHeight: "90vh",
        backgroundColor: "#000A06",
        border: "2px solid #1BFFA8",
        borderRadius: "16px",
        overflow: "hidden",
        alignItems: "stretch",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
      }}>
        <style>{`
          @media (max-width: 640px) {
            .signup-modal-inner { flex-direction: column !important; width: 88vw !important; height: auto !important; max-height: 90vh !important; }
            .signup-modal-left { width: 100% !important; }
            .signup-modal-right { display: none !important; }
          }
          @media (min-width: 641px) and (max-width: 900px) {
            .signup-modal-inner { width: 90vw !important; }
            .signup-modal-left { width: 55% !important; }
            .signup-modal-right { width: 45% !important; }
          }
          @media (max-width: 400px) {
            .or-divider-line { width: 4px !important; }
          }
        
          .signup-modal-left input:-webkit-autofill,
          .signup-modal-left input:-webkit-autofill:hover,
          .signup-modal-left input:-webkit-autofill:focus,
          .signup-modal-left select:-webkit-autofill,
          .signup-modal-left select:-webkit-autofill:hover,
          .signup-modal-left select:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px #0A1F15 inset !important;
            -webkit-text-fill-color: white !important;
            caret-color: white;
          }
        `}</style>
        {/* close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "12px", right: "12px", zIndex: 1001,
            background: "transparent", border: "1px solid #1BFFA8",
            borderRadius: "50%", width: "22px", height: "22px",
            cursor: "pointer", color: "#1BFFA8", fontSize: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Close"
        >&#x2715;</button>
        {/* left panel */}
        <div className="signup-modal-left" style={{ width: "50%", backgroundColor: "#000A06", padding: "32px", minHeight: "520px", display: "flex", flexDirection: "column" }}>
      {showEmailSent ? (
        <div className="text-center flex flex-col justify-center" style={{ minHeight: "400px" }}>
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#1BFFA8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#1BFFA8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1BFFA8] mb-3">
              Check Your Email
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Verification link sent to <strong>{userEmail}</strong>
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowEmailSent(false);
                onClose();
              }}
              className="w-full px-6 py-2 bg-[#1BFFA8]/10 border border-[#1BFFA8] text-[#1BFFA8] hover:bg-[#1BFFA8]/20 rounded-lg transition-all duration-200 font-medium"
            >
              Got it
            </button>
            <button
              onClick={() => {
                setShowEmailSent(false);
                setError("");
              }}
              className="w-full px-6 py-2 text-gray-400 hover:text-gray-300 transition-colors duration-200 text-sm"
            >
              Try different email
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-2 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              <span className="text-white">Join </span>
              <span className="text-[#1BFFA8]">QuickLearnAI</span>
            </h2>
            <p className="text-white mt-2">Start your learning journey today</p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 mb-6 rounded-lg"
            style={{ backgroundColor: "#111111", border: "" }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("student")}
              onMouseEnter={() => setHoveredTab("student")}
              onMouseLeave={() => setHoveredTab(null)}
              style={getTabStyle("student")}
              className="px-4 py-2 rounded-lg font-medium text-sm"
            >Student</button>
            <button
              type="button"
              onClick={() => setActiveTab("teacher")}
              onMouseEnter={() => setHoveredTab("teacher")}
              onMouseLeave={() => setHoveredTab(null)}
              style={getTabStyle("teacher")}
              className="px-4 py-2 rounded-lg font-medium text-sm"
            >Teacher</button>
          </div>

          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabContent value="student" selected={activeTab === "student"}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
                    required
                  />
                </div>

                {/* Student Mobile */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="1234567890"
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
                    required
                  />
                </div>

                {/* Student Email */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@example.com"
                    className="w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
                    required
                  />
                </div>

                {/* Student Password */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#1BFFA8]/10 border border-[#1BFFA8] text-[#1BFFA8] hover:bg-[#1BFFA8]/20 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#1BFFA8] border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing Up...</span>
                    </div>
                  ) : (
                    "Sign Up as Student"
                  )}
                </button>
              </form>
            </TabContent>

            <TabContent value="teacher" selected={activeTab === "teacher"}>
              <div className="flex flex-col items-center justify-center" style={{ minHeight: "340px" }}>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#1BFFA8] mb-4">
                    Teacher Registration
                  </h3>
                  <p className="text-white text-base mb-6">
                    To sign up as a teacher, please contact:
                  </p>
                  <a
                    href="mailto:iamquicklearn.ai@gmail.com"
                    className="text-[#1BFFA8] hover:underline text-lg font-semibold inline-block"
                  >
                    iamquicklearn.ai@gmail.com
                  </a>
                </div>
              </div>
            </TabContent>
          </Tabs>

          <div className="text-center text-sm text-white mt-6">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-[#1BFFA8] hover:text-[#1BFFA8]/80 font-medium transition-colors"
            >
              Log in
            </button>
          </div>
        </>
      )}
      </div>
      {/* right panel*/}
      <div className="signup-modal-right" style={{ width: "50%", maxWidth: "50%", alignSelf: "stretch", flexShrink: 0, minHeight: "400px", overflow: "hidden" }}>
          <ImageCarousel />
      </div>
      </div>
    </Dialog>
  );
};

SignUpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func.isRequired,
};

export default SignUpModal;
