import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Core components (keep these for immediate loading)
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";

import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import SignUpModal from "./components/SignUpModal";
import PrivateRoute from "./components/PrivateRoute";
import MaintenancePopup from "./components/MaintenancePopup";
import AboutUs from "./pages/AboutUs";

// Lazy load heavy components for better performance
const QuizGenerator = lazy(() => import("./pages/quiz"));
const QuizSummary = lazy(() => import("./pages/quizsummary"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const TeacherDashboard = lazy(() => import("./components/TeacherDashboard"));
const RecommendationPage = lazy(() => import("./pages/recommendation"));
const QuizPlay = lazy(() => import("./pages/quizplay"));
const ChatBot = lazy(() => import("./pages/ChatBot"));
const MindMap = lazy(() => import("./pages/MindMap"));
const DocChat = lazy(() => import("./pages/DocChat"));
const DoubtCreation = lazy(() => import("./components/DoubtCreation"));
const ChatRoom = lazy(() => import("./components/ChatRoom"));
const MatchedTeachers = lazy(() => import("./components/MatchedTeachers"));
const CreateQuiz = lazy(() => import("./pages/CreateQuiz"));
const QuizSession = lazy(() => import("./pages/QuizSession"));
const QuizPreview = lazy(() => import("./pages/QuizPreview"));
const QuizPreviewNew = lazy(() => import("./pages/QuizPreviewNew"));
const QuizLobby = lazy(() => import("./pages/QuizLobby"));
const QuizResults = lazy(() => import("./pages/QuizResults"));
const QuizRecordDetail = lazy(() => import("./pages/QuizRecordDetail"));
const StudentResults = lazy(() => import("./pages/StudentResults"));
const StudentLobby = lazy(() => import("./pages/StudentLobby"));
const YouTubeChat = lazy(() => import("./pages/YouTubeChat"));
const QuestionPaperGenerator = lazy(
  () => import("./pages/QuestionPaperGenerator"),
);
const Subscription = lazy(() => import("./components/Subscription"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const QuestionBankGenerator = lazy(
  () => import("./components/QuestionBankGenerator"),
);
const AIChat = lazy(() => import("./pages/AIChat"));
const Statistics = lazy(() => import("./components/Statstics"));
const TextHoverEffect = lazy(() => import("./components/TextHoverEffect"));
const ContainerScrollDemo = lazy(() => import("./components/ContainerScrollDemo"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));

// Optimized loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Optimized Home component with performance improvements
function Home() {
  const contentRef = useRef();
  const observerRef = useRef();
  const [isVisible, setIsVisible] = useState(new Set());

  // Memoized intersection observer configuration
  const observerConfig = useMemo(
    () => ({
      threshold: 0.05,
      rootMargin: "100px 0px -50px 0px",
    }),
    [],
  );

  // Optimized intersection observer with RAF and debouncing
  useEffect(() => {
    let animationFrame;

    const handleIntersection = (entries) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const newVisible = new Set(isVisible);
        let hasChanges = false;

        entries.forEach((entry) => {
          const id = entry.target.dataset.sectionId;
          if (entry.isIntersecting && !newVisible.has(id)) {
            newVisible.add(id);
            hasChanges = true;
            // Use CSS transforms for better performance
            entry.target.style.transform = "translateY(0) translateZ(0)";
            entry.target.style.opacity = "1";
            entry.target.classList.add("animate-fade-in");
          }
        });

        if (hasChanges) {
          setIsVisible(newVisible);
        }
      });
    };

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerConfig,
    );

    // More efficient DOM query - only query once
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll("[data-section-id]");
      sections.forEach((section, index) => {
        // Pre-optimize with CSS transforms
        section.style.transform = "translateY(20px) translateZ(0)";
        section.style.opacity = "0";
        section.style.transition =
          "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        section.style.transitionDelay = `${index * 20}ms`;
        section.style.willChange = "transform, opacity";

        observerRef.current.observe(section);
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [observerConfig, isVisible]);

  return (
    <>
      {/* Hero Section - immediate load */}
      <div className="min-h-screen max-w-7xl mx-auto flex flex-col">
        <Hero />
      </div>

      {/* Main Content with Optimized Animations */}
      <div ref={contentRef} className="space-y-32">
        <section data-section-id="features" className="transform-gpu">
          <Suspense fallback={<LoadingSpinner />}>
            <Features />
          </Suspense>
        </section>

        {/* Aceternity Container Scroll Animation — lazy loaded */}
        <section data-section-id="scroll-demo" className="transform-gpu">
          <Suspense fallback={<LoadingSpinner />}>
            <ContainerScrollDemo />
          </Suspense>
        </section>

        <section data-section-id="statistics" className="transform-gpu">
          <Suspense fallback={<LoadingSpinner />}>
            <Statistics />
          </Suspense>
        </section>

        <section data-section-id="text-effect" className="transform-gpu">
          <div className="w-full h-80 flex items-center justify-center py-16 px-4">
            <Suspense fallback={<LoadingSpinner />}>
              <TextHoverEffect text="QUICKLEARNAI" className="w-full" />
            </Suspense>
          </div>
        </section>

        <section data-section-id="faq" className="transform-gpu">
          <FAQ />
        </section>
      </div>

      <Footer />

      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </>
  );
}

// Optimized App component
function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleLoginClose = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleSignUpClose = useCallback(() => {
    setShowSignUpModal(false);
  }, []);

  const handleLoginClick = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const handleSignUpClick = useCallback(() => {
    setShowSignUpModal(true);
  }, []);

  const handleSwitchToSignUp = useCallback(() => {
    setShowLoginModal(false);
    setShowSignUpModal(true);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  }, []);

  // Memoized Navbar wrapper to prevent unnecessary re-renders
  const NavbarWrapper = useMemo(() => {
    const Component = () => {
      return (
        <Navbar
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
        />
      );
    };
    return Component;
  }, [handleLoginClick, handleSignUpClick]);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Toast with optimized config */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
          style={{ zIndex: 9999 }}
        />

        {/* Global Maintenance Popup */}
        <MaintenancePopup />

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Standalone routes without layout */}
            <Route path="/verify-email" element={<EmailVerification />} />

            {/* Main app routes with navbar */}
            <Route
              path="/*"
              element={
                <>
                  <NavbarWrapper />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute
                          element={<ProfilePage />}
                          allowedRoles={["student"]}
                        />
                      }
                    />
                    <Route
                      path="/teacher-dashboard"
                      element={
                        <PrivateRoute
                          element={<TeacherDashboard />}
                          allowedRoles={["teacher"]}
                        />
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <PrivateRoute
                          element={<AdminDashboard />}
                          allowedRoles={["admin"]}
                        />
                      }
                    />

                    <Route path="/quiz" element={<QuizGenerator />} />
                    <Route path="/quizsummary" element={<QuizSummary />} />
                    <Route path="/quizplay" element={<QuizPlay />} />
                    <Route path="/chatbot" element={<ChatBot />} />
                    <Route path="/doc-chat" element={<DocChat />} />
                    <Route
                      path="/recommendations"
                      element={<RecommendationPage />}
                    />
                    <Route path="/mindmap" element={<MindMap />} />
                    <Route
                      path="/doubt/create"
                      element={
                        <PrivateRoute
                          element={<DoubtCreation />}
                          allowedRoles={["student"]}
                        />
                      }
                    />
                    <Route path="/doubt/:doubtId/chat" element={<ChatRoom />} />
                    <Route
                      path="/doubt/:doubtId/matched"
                      element={<MatchedTeachers />}
                    />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/aboutus" element={<AboutUs />} />
                    <Route
                      path="/create-quiz"
                      element={
                        <PrivateRoute
                          element={<CreateQuiz />}
                          allowedRoles={["teacher"]}
                        />
                      }
                    />
                    <Route
                      path="/quiz-session/:roomId"
                      element={<QuizSession />}
                    />
                    <Route path="/quiz-preview" element={<QuizPreview />} />
                    <Route
                      path="/quiz-preview-new"
                      element={<QuizPreviewNew />}
                    />
                    <Route
                      path="/quiz-lobby/:roomId"
                      element={
                        <PrivateRoute
                          element={<QuizLobby />}
                          allowedRoles={["teacher", "student"]}
                        />
                      }
                    />
                    <Route path="/quiz-results" element={<QuizResults />} />
                    <Route
                      path="/quiz-record/:recordId"
                      element={
                        <PrivateRoute
                          element={<QuizRecordDetail />}
                          allowedRoles={["teacher"]}
                        />
                      }
                    />
                    <Route
                      path="/student-results"
                      element={<StudentResults />}
                    />
                    <Route
                      path="/student-lobby/:roomId"
                      element={<StudentLobby />}
                    />
                    <Route path="/youtube-chat" element={<YouTubeChat />} />
                    <Route
                      path="/paper-generate"
                      element={
                        <PrivateRoute
                          element={<QuestionPaperGenerator />}
                          allowedRoles={["teacher"]}
                        />
                      }
                    />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route
                      path="/question-bank"
                      element={<QuestionBankGenerator />}
                    />
                    <Route path="/ai-chat" element={<AIChat />} />
                  </Routes>
                </>
              }
            />
          </Routes>
        </Suspense>

        {/* Optimized Modals with lazy rendering */}
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={handleLoginClose}
            onSignUpClick={handleSwitchToSignUp}
          />
        )}
        {showSignUpModal && (
          <SignUpModal
            isOpen={showSignUpModal}
            onClose={handleSignUpClose}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
