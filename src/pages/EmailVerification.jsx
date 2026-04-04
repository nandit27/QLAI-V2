import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader,
  Mail,
  ArrowRight,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("");

  // Extract session once to prevent dependency issues
  const session = useMemo(() => searchParams.get("session"), [searchParams]);

  useEffect(() => {
    if (!session) {
      setStatus("error");
      setMessage(
        "Invalid verification link. Please check your email and try again.",
      );
      return;
    }

    // Check if this session was already processed
    const sessionKey = `email_verification_${session}`;
    console.log("Checking session key:", sessionKey);
    const savedState = sessionStorage.getItem(sessionKey);

    if (savedState) {
      // Restore the previous state
      const {
        status: savedStatus,
        message: savedMessage,
        userType: savedUserType,
      } = JSON.parse(savedState);
      setStatus(savedStatus);
      setMessage(savedMessage);
      setUserType(savedUserType || "");

      // Auto-redirect if it was successful
      if (savedStatus === "success") {
        setTimeout(() => {
          window.location.href = "/";
        }, 5000);
      }
    } else {
      // Mark as processing to prevent duplicate calls
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({ status: "verifying" }),
      );
      verifyEmail(session);
    }
  }, [session]);

  const verifyEmail = async (session) => {
    const sessionKey = `email_verification_${session}`;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/verify?session=${session}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          const newState = {
            status: "success",
            message: data.message,
            userType: data.userType || "",
          };

          setStatus("success");
          setMessage(data.message);
          setUserType(data.userType || "");

          // Save successful state
          sessionStorage.setItem(sessionKey, JSON.stringify(newState));

          // Auto redirect after 5 seconds
          setTimeout(() => {
            window.location.href = "/";
          }, 5000);
        } else {
          const newState = {
            status: "error",
            message: data.message || "Email verification failed.",
          };

          setStatus("error");
          setMessage(data.message || "Email verification failed.");
          sessionStorage.setItem(sessionKey, JSON.stringify(newState));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          "Email verification failed. The link may have expired or is invalid.";

        const newState = {
          status: "error",
          message: errorMessage,
        };

        setStatus("error");
        setMessage(errorMessage);
        sessionStorage.setItem(sessionKey, JSON.stringify(newState));
      }
    } catch {
      const errorMessage =
        "An error occurred during email verification. Please try again later.";
      const newState = {
        status: "error",
        message: errorMessage,
      };

      setStatus("error");
      setMessage(errorMessage);
      sessionStorage.setItem(sessionKey, JSON.stringify(newState));
    }
  };

  const getIcon = () => {
    switch (status) {
      case "verifying":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Loader className="w-20 h-20 text-[#00FF9D] mx-auto" />
            <motion.div
              className="absolute inset-0 w-20 h-20 border-4 border-[#00FF9D]/30 border-t-[#00FF9D] rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        );
      case "success":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <CheckCircle className="w-20 h-20 text-[#00FF9D] mx-auto" />
            <motion.div
              className="absolute inset-0 w-20 h-20 bg-[#00FF9D]/20 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        );
      case "error":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <XCircle className="w-20 h-20 text-red-400 mx-auto" />
          </motion.div>
        );
      default:
        return <Loader className="w-20 h-20 text-gray-500 mx-auto" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "verifying":
        return "Verifying Your Email...";
      case "success":
        return "Email Verified Successfully!";
      case "error":
        return "Verification Failed";
      default:
        return "Email Verification";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "verifying":
        return "text-[#00FF9D]";
      case "success":
        return "text-[#00FF9D]";
      case "error":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF9D]/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1BFFA8]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Hide any existing navigation */}
      <style>
        {`
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
            font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
          }

          nav, header, .navbar, .nav {
            display: none !important;
          }
        `}
      </style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl shadow-[#00FF9D]/10">
          {/* QuickLearnAI Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-[#00FF9D] mr-3" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00FF9D] to-[#1BFFA8] bg-clip-text text-transparent">
                QuickLearnAI
              </h1>
            </div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00FF9D] to-[#1BFFA8] rounded-full mx-auto" />
          </motion.div>

          {/* Status Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mb-8"
          >
            {getIcon()}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className={`text-2xl font-bold text-center mb-6 ${getStatusColor()}`}
          >
            {getTitle()}
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-gray-400 text-center mb-8 leading-relaxed"
          >
            {message || "Please wait while we verify your email address..."}
          </motion.p>

          {/* Teacher Special Message */}
          {userType === "teacher" && status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-6 mb-8 rounded-xl"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">!</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                    Next Steps for Teachers
                  </h4>
                  <ul className="text-sm text-yellow-200/80 space-y-1">
                    <li>• Your account is under review by our admin team</li>
                    <li>
                      • You'll receive an email notification once approved
                    </li>
                    <li>• This process typically takes 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="space-y-4"
          >
            {status === "success" && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="/"
                  className="group w-full bg-gradient-to-r from-[#00FF9D] to-[#1BFFA8] hover:from-[#00FF9D]/80 hover:to-[#1BFFA8]/80 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-[#00FF9D]/20"
                >
                  <span>Continue to QuickLearnAI</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <motion.button
                  onClick={() => {
                    if (session) {
                      const sessionKey = `email_verification_${session}`;
                      sessionStorage.removeItem(sessionKey);
                    }
                    window.location.reload();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 hover:border-red-500/70 text-red-400 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                >
                  Try Again
                </motion.button>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full bg-black/50 border border-gray-800 hover:bg-black/70 hover:border-[#00FF9D]/30 text-gray-400 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go to Home</span>
                </motion.a>
              </div>
            )}

            {status === "verifying" && (
              <div className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-semibold py-4 px-6 rounded-xl cursor-not-allowed opacity-60">
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader className="w-5 h-5" />
                  </motion.div>
                  <span>Verifying...</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Auto-redirect Notice */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mt-6 p-4 bg-[#00FF9D]/10 border border-[#00FF9D]/20 rounded-lg"
            >
              <p className="text-sm text-[#00FF9D] text-center flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>
                  You will be automatically redirected in 5 seconds...
                </span>
              </p>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="mt-8 pt-6 border-t border-gray-800/50"
          >
            <p className="text-xs text-gray-500 text-center">
              © 2024 QuickLearnAI. All rights reserved.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
