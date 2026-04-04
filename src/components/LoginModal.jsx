import { useState, useEffect } from "react";
import Dialog from "./Dialog";
import { Tabs, TabContent } from "./Tabs";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
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

const LoginModalContent = ({ isOpen, onClose, onSignUpClick }) => {
  const [activeTab, setActiveTab] = useState("student");
  const [hoveredTab, setHoveredTab] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
      role: activeTab,
    };

    if (
      email === "iamquicklearn.ai@gmail.com" &&
      password === "Quicklearn@123"
    ) {
      data.role = "admin";
    }
    console.log(data);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      console.log("Login response:", response.data); // Debug log

      if (response.data && response.data.user) {
        const { user, token } = response.data;
        const userInfo = {
          email: user.email,
          username: user.username,
          token,
          avatar: user.avatar,
          role: data.role, // Use the role from our request data
          _id: user._id,
        };

        localStorage.setItem("user-info", JSON.stringify(userInfo));

        // Dispatch custom event to update navbar state
        window.dispatchEvent(new Event("authStateChanged"));

        // Close the modal first
        onClose();

        // Then handle navigation
        if (data.role === "admin") {
          navigate("/admin");
        } else if (data.role === "teacher") {
          navigate("/teacher-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || error.message || "Login failed",
      );
    }
  };

  const googleAuth = async (code) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/google?code=${code}&role=${activeTab}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
      return response;
    } catch (error) {
      console.error("Google auth error:", error);
      throw error;
    }
  };

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);

        if (result.data && result.data.token) {
          const { email, username, avatar, _id } = result.data.user;
          const token = result.data.token;
          const userInfo = {
            email,
            username,
            token,
            avatar,
            role: activeTab,
            _id,
          };

          localStorage.setItem("user-info", JSON.stringify(userInfo));

          // Dispatch custom event to update navbar state
          window.dispatchEvent(new Event("authStateChanged"));

          onClose();
          // Redirect based on role
          if (activeTab === "teacher") {
            navigate("/teacher-dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          throw new Error("No token received from server");
        }
      } else {
        throw new Error("No authorization code present");
      }
    } catch (e) {
      console.error("Error during Google Login:", e);
      setError(e.message || "Failed to login with Google");
    }
  };

  //single helper — keeps button style logic clean
  const getTabStyle = (tab) =>
    activeTab === tab
      ? { backgroundColor: "#0C3D2A", border: "1px solid #1BFFA8", color: "#1BFFA8" }
      : { backgroundColor: "transparent", border: "1px solid #1BFFA8", color: hoveredTab === tab ? "#1BFFA8" : "white" };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error("Google Login Error:", error);
    },
    flow: "auth-code",
    scope: "email profile",
    redirect_uri: window.location.origin,
  });

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="login-modal-inner" style={{
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
            .login-modal-inner { flex-direction: column !important; width: 88vw !important; height: auto !important; max-height: 90vh !important; }
            .login-modal-left { width: 100% !important; }
            .login-modal-right { display: none !important; }
          }
          @media (min-width: 641px) and (max-width: 900px) {
            .login-modal-inner { width: 90vw !important; }
            .login-modal-left { width: 55% !important; }
            .login-modal-right { width: 45% !important; }
          }
            @media (max-width: 400px) {
            .or-divider-line { width: 4px !important; }
          }
        
          .login-modal-left input:-webkit-autofill,
          .login-modal-left input:-webkit-autofill:hover,
          .login-modal-left input:-webkit-autofill:focus {
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
        <div className="login-modal-left" style={{ width: "50%", backgroundColor: "#000A06", padding: "32px", minHeight: "520px", display: "flex", flexDirection: "column" }}>
      {error && (
        <div className="mb-4 p-2 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
            <span className="text-white">Welcome to </span>
            <span className="text-[#1BFFA8]">QuickLearnAI</span>
          </h2>
          <p className="text-white-400 mt-2">Log In to continue</p>
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
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                className= "w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your Password"
                  className="w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
              />
            </div>
            <div className="flex justify-between items-center">
              <a
                href="#"
                className="text-base text-[#1BFFA8] hover:text-[#1BFFA8]/80"
              >
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#1BFFA8]/10 border border-[#1BFFA8] text-[#1BFFA8] hover:bg-[#1BFFA8]/20 rounded-lg transition-all duration-200 font-medium"
            >
              Login as Student
            </button>

            {/* //added divider */}
            <div className="flex items-center justify-center gap-3 text-gray-500 text-sm my-1">
                <span className="w-8 h-px bg-gray-600"></span>
                <span>or</span>
                <span className="w-8 h-px bg-gray-600"></span>
              </div>

            {/* Google Login Button */}
            <div className="text-center">
              <button
                onClick={googleLogin}
                type="button"
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all" style={{ backgroundColor: "#1a1f2e", border: "1px solid #2d3748" }}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="w-5 h-5"
                  alt="Google"
                />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="text-center text-sm text-white">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  onClose();
                  onSignUpClick();
                }}
                className="text-[#1BFFA8] hover:text-[#1BFFA8]/80 font-medium transition-colors"
              >
                Sign up
              </button>
            </div>
          </form>
        </TabContent>

        <TabContent value="teacher" selected={activeTab === "teacher"}>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="teacher@example.com"
                className="w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your Password"
                className="w-full px-4 py-2 bg-[#0A1F15] border border-[#1B3A2A] rounded-lg focus:outline-none focus:border-[#1BFFA8] focus:ring-1 focus:ring-[#1BFFA8] transition-all text-white placeholder-[#3B6756]"
                  />
            </div>
            <div className="flex justify-between items-center">
              <a
                href="#"
                className="text-base text-[#1BFFA8] hover:text-[#1BFFA8]/80">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#1BFFA8]/10 border border-[#1BFFA8] text-[#1BFFA8] hover:bg-[#1BFFA8]/20 rounded-lg transition-all duration-200 font-medium"
            >
              Login as Teacher
            </button>

            {/* added divider */}
            <div className="flex items-center justify-center gap-3 text-gray-500 text-sm my-1">
                <span className="w-8 h-px bg-gray-600"></span>
                <span>or</span>
                <span className="w-8 h-px bg-gray-600"></span>
              </div>

            <div className="text-center my-1" style={{ fontSize: "14px" }}>
              <span className="text-gray-400">Need help? Contact </span>
              <a
              href="mailto:iamquicklearn.ai@gmail.com"
              className="text-[#1BFFA8] hover:underline"
              >
              iamquicklearn.ai@gmail.com
              </a>
          </div>
          </form>
        </TabContent>
      </Tabs>
      </div>
      {/* right panel*/}
      <div className="login-modal-right" style={{ width: "50%", maxWidth: "50%", alignSelf: "stretch", flexShrink: 0, minHeight: "400px", overflow: "hidden" }}>
          <ImageCarousel />
      </div>
      </div>
    </Dialog>
  );
};

LoginModalContent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSignUpClick: PropTypes.func.isRequired,
};

// Wrapper component that provides Google OAuth context
const LoginModal = (props) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LoginModalContent {...props} />
    </GoogleOAuthProvider>
  );
};

LoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSignUpClick: PropTypes.func.isRequired,
};

export default LoginModal;
