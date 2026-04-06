import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Loader2,
  Mic,
  Repeat,
  Send,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  X,
  Trash2,
  Check,
} from "lucide-react";
import { documentService, docChatService } from "../services/api";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const getFileUrlFromUploadResponse = (uploadResponse) => {
  if (!uploadResponse) return null;
  // Try common fields
  return (
    uploadResponse.file_url ||
    uploadResponse.url ||
    uploadResponse.path ||
    uploadResponse.location ||
    null
  );
};

const BotActions = ({ content, onRegenerate, onThumb, ttsEnabled }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [thumbsState, setThumbsState] = useState(null); // 'up', 'down', or null

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      // Use browser TTS
      const u = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.cancel();
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleThumbClick = (type) => {
    setThumbsState(type);
    onThumb(type);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-1"
    >
      {/* Thumbs Up */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleThumbClick("up")}
        className={`group relative p-2 rounded-lg transition-all duration-200 ${
          thumbsState === "up" 
            ? "bg-primary/20 text-[#00AA55] dark:text-[#95ff00]" 
            : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        }`}
        title="Helpful"
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Helpful
        </span>
      </motion.button>

      {/* Thumbs Down */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleThumbClick("down")}
        className={`group relative p-2 rounded-lg transition-all duration-200 ${
          thumbsState === "down" 
            ? "bg-red-500/20 text-red-500 dark:text-red-400" 
            : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        }`}
        title="Not helpful"
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Not helpful
        </span>
      </motion.button>

      {/* Regenerate */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRegenerate}
        className="group relative p-2 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-[#00AA55] dark:hover:text-[#95ff00] transition-all duration-200"
        title="Regenerate"
      >
        <Repeat className="w-4 h-4" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Regenerate
        </span>
      </motion.button>

      {/* Copy */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className={`group relative p-2 rounded-lg transition-all duration-200 ${
          copied
            ? "bg-primary/20 text-[#00AA55] dark:text-[#95ff00]"
            : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        }`}
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {copied ? "Copied!" : "Copy"}
        </span>
      </motion.button>

      {/* TTS */}
      {ttsEnabled && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpeak}
          disabled={isSpeaking}
          className={`group relative p-2 rounded-lg transition-all duration-200 ${
            isSpeaking
              ? "bg-primary/20 text-[#00AA55] dark:text-[#95ff00] cursor-wait"
              : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
          title="Read aloud"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`} />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Read aloud
          </span>
        </motion.button>
      )}
    </motion.div>
  );
};

const DocChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uploadResponse = location.state?.uploadResponse || null;
  const initialMessage = location.state?.initialMessage || null;
  const fileName = location.state?.fileName || "Document";
  const filePreviewUrlFromState = location.state?.filePreviewUrl || null;
  const fileUrl = useMemo(
    () =>
      filePreviewUrlFromState || getFileUrlFromUploadResponse(uploadResponse),
    [filePreviewUrlFromState, uploadResponse],
  );

  const [messages, setMessages] = useState(() =>
    initialMessage ? [{ type: "bot", content: initialMessage }] : [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const lastUserQueryRef = useRef("");
  const gridRef = useRef(null);
  const [leftPercent, setLeftPercent] = useState(55); // default 55% left, 45% right
  const [clearingEmbeddings, setClearingEmbeddings] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleAsk = async (text) => {
    const query = (text ?? input).trim();
    if (!query) return;
    
    // Validate required parameters before making the request
    if (!fileName || fileName === "Document") {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Please upload a document first before asking questions.",
        },
      ]);
      return;
    }

    lastUserQueryRef.current = query;
    setMessages((prev) => [...prev, { type: "user", content: query }]);
    setInput("");
    setLoading(true);
    
    try {
      console.log("Retrieving user info from localStorage");
      const userData = JSON.parse(localStorage.getItem("user-info"));
      console.log("User data:", userData);
      const userId = userData._id || userData.id;
      
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
      
      console.log("Making query request with:", { query, fileName, userId });
      const resp = await docChatService.queryDocument(query, fileName, userId);
      setMessages((prev) => [...prev, { type: "bot", content: resp.answer }]);
    } catch (err) {
      console.error("Query API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: `Error: ${err.message || 'Something went wrong. Please try again.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastUserQueryRef.current) return;
    await handleAsk(lastUserQueryRef.current);
  };

  const handleThumb = (_type) => {
    // Placeholder for future feedback API. No-op for now.
  };

  const handleClearFiles = async () => {
    setClearingEmbeddings(true);
    try {
      await docChatService.clearFiles();
      // Clear local chat state after successful API call
      setMessages([]);
      setInput("");
      lastUserQueryRef.current = "";
      console.log("Files cleared successfully");
      // Redirect to chatbot page
      navigate("/chatbot");
    } catch (error) {
      console.error("Failed to clear files:", error);
      // You could add toast notification here if available
    } finally {
      setClearingEmbeddings(false);
    }
  };

  // Only clear files explicitly via button OR a hard browser unload.
  // We intentionally avoid clearing on route navigation to prevent duplicate/early clears.
  useEffect(() => {
    const clearedFlagKey = "__docchat_files_cleared";
    const hasClearedRef = { current: false };

    const handleBeforeUnload = () => {
      // Ensure we only attempt once per actual browser unload.
      if (hasClearedRef.current) return;
      hasClearedRef.current = true;
      sessionStorage.setItem(clearedFlagKey, "1");
      try {
        const url = `${import.meta.env.VITE_API_URL}/gen/clear_files`;
        // Best-effort; server expects JSON body.
        const blob = new Blob([JSON.stringify({})], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } catch (_) {
        /* swallow */
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Do NOT call clearFiles() here to avoid double invocation on soft navigations.
    };
  }, []);

  const startResize = (downEvent) => {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    const total = gridEl.getBoundingClientRect().width;
    const startX = downEvent.clientX;
    const startLeftPx = (leftPercent / 100) * total;
    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const newLeftPx = Math.min(
        Math.max(240, startLeftPx + delta),
        total - 300,
      );
      const newLeftPercent = (newLeftPx / total) * 100;
      setLeftPercent(newLeftPercent);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Build PDF viewer URL is no longer needed since we revert to simple iframe
  // which prevents browser embed restrictions that cause blank previews.

  return (
    <div className="min-h-screen bg-[#f1f3f6] dark:bg-black text-slate-900 dark:text-white pt-28 overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] px-6 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-[#95ff00] dark:to-[#00CC7D] dark:bg-clip-text">
              Document Chat
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
              Ask questions and get instant insights from your document
            </p>
          </div>
        </motion.div>
        
        <div
          ref={gridRef}
          className="grid gap-6 flex-1 min-h-0 overflow-hidden"
          style={showPreview ? {
            gridTemplateColumns: `minmax(240px, ${leftPercent}%) 12px minmax(300px, ${100 - leftPercent}%)`,
          } : {
            gridTemplateColumns: "1fr"
          }}
        >
          {/* Left: Document preview */}
          {showPreview && (
          <section className="bg-white dark:bg-black/40 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 h-full overflow-hidden flex flex-col shadow-sm">
            <div className="h-16 px-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined font-variation-settings-fill-0">description</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{fileName}</h2>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex justify-center bg-slate-50 dark:bg-transparent">
              {fileUrl ? (
                <iframe
                  src={fileUrl}
                  title="Document Preview"
                  className="w-full h-full bg-white dark:bg-black border-none"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-gray-400">
                  Preview unavailable
                </div>
              )}
            </div>
          </section>
          )}

          {/* Resize handle */}
          {showPreview && (
          <div
            className="hidden md:flex h-full items-center justify-center group"
            aria-hidden="true"
            onMouseDown={startResize}
          >
            <div className="w-2 h-20 mx-auto bg-slate-200 dark:bg-white/5 hover:bg-primary dark:hover:bg-[#95ff00]/40 transition-colors cursor-col-resize rounded-full" />
          </div>
          )}

          {/* Right: Chat */}
          <section className="bg-white dark:bg-black/40 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 h-full flex flex-col overflow-hidden shadow-sm">
            {/* Chat header from HTML new layout */}
            <div className="h-16 px-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                  title={showPreview ? "Full Screen Chat" : "Show Document"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPreview ? "fullscreen" : "fullscreen_exit"}
                  </span>
                </button>
                <div className="w-8 h-8 bg-primary dark:bg-white/10 rounded-full flex items-center justify-center hidden sm:flex">
                  <span className="material-symbols-outlined text-black dark:text-[#95ff00] text-lg font-variation-settings-fill-1">auto_awesome</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">QuickLearn Assistant</h2>
              </div>
              <button 
                onClick={handleClearFiles} 
                disabled={clearingEmbeddings}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-500 mb-0 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 transition-all bg-white dark:bg-transparent shadow-sm"
                title="Clear Chat"
              >
                {clearingEmbeddings ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                   <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline leading-none mt-0.5">Clear Chat</span>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-transparent custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {m.type === "user" ? (
                      /* User Message */
                      <div className="flex items-start gap-4 justify-end">
                        <div className="flex-1 flex flex-col items-end space-y-2">
                          <div className="bg-primary dark:bg-primary/20 text-black dark:text-[#95ff00] p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[90%]">
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-primary dark:bg-primary/20 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-black dark:text-[#95ff00] text-sm font-variation-settings-fill-1">person</span>
                        </div>
                      </div>
                    ) : (
                      /* Bot Message */
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-slate-500 dark:text-[#95ff00] text-sm">smart_toy</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="prose prose-slate dark:prose-invert max-w-none 
                                prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 
                                prose-p:text-slate-600 dark:prose-p:text-gray-300 prose-p:my-2 prose-p:leading-relaxed prose-p:text-[14px]
                                prose-strong:text-slate-900 dark:prose-strong:text-[#95ff00] prose-strong:font-semibold 
                                prose-li:text-slate-600 dark:prose-li:text-gray-300 prose-li:my-1 prose-li:text-[14px]
                                prose-ul:list-none prose-ul:pl-0 prose-ul:my-3 prose-ul:space-y-2 
                                prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-3 prose-ol:space-y-2">
                              <ReactMarkdown
                                components={{
                                  h2: ({node, ...props}) => (
                                    <h2 className="text-lg font-bold mt-4 mb-2 flex items-center gap-2" {...props}>
                                      <span className="w-1.5 h-6 bg-primary dark:bg-[#95ff00] rounded-full"></span>
                                      {props.children}
                                    </h2>
                                  ),
                                  h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-3 mb-1.5" {...props} />,
                                  ul: ({node, ...props}) => <ul {...props} />,
                                  ol: ({node, ...props}) => <ol {...props} />,
                                  li: ({node, children, ...props}) => (
                                    <li className="flex items-start gap-2" {...props}>
                                      <span className="material-symbols-outlined text-green-600 dark:text-[#95ff00] text-base mt-0.5 font-variation-settings-fill-1">check_circle</span>
                                      <span className="flex-1">{children}</span>
                                    </li>
                                  ),
                                  p: ({node, ...props}) => <p {...props} />,
                                  strong: ({node, ...props}) => <strong {...props} />,
                                }}
                              >
                                {m.content}
                              </ReactMarkdown>
                            </div>
                            <BotActions
                              content={m.content}
                              onRegenerate={handleRegenerate}
                              onThumb={handleThumb}
                              ttsEnabled={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500 dark:text-[#95ff00] text-sm">smart_toy</span>
                  </div>
                  <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 text-slate-500 dark:text-[#95ff00]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Analyzing document...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Area */}
            <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-black/40">
              <div className="relative bg-slate-100 dark:bg-[#1E1E1E] rounded-2xl p-2 flex items-center gap-3 border border-transparent focus-within:border-primary/30 dark:focus-within:border-[#95ff00]/30 transition-colors pl-4">
                <TextareaAutosize
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about this document..."
                  minRows={1}
                  maxRows={4}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] text-slate-700 dark:text-white placeholder:text-slate-400 p-2 resize-none outline-none"
                  disabled={loading || recording}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                />
                {/* Voice Input Button */}
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title="Voice input"
                >
                  <span className="material-symbols-outlined">mic</span>
                </button>
                {/* Send Button */}
                <button
                  onClick={() => handleAsk()}
                  disabled={loading || !input.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${
                    loading || !input.trim()
                      ? "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-primary dark:bg-primary/20 text-black dark:text-[#95ff00] hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined font-variation-settings-fill-1">arrow_right_alt</span>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-4 font-medium">Quick Learn.AI can make mistakes. Verify important information.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocChat;
