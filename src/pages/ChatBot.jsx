import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";
import { documentService } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

const ChatBot = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const uploadAbortController = useRef(null);

  // Removed automatic clearing on route navigation to prevent multiple calls.
  // We'll only rely on DocChat's explicit clear OR manual user action there.
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/gen/clear_files`;
        const blob = new Blob([JSON.stringify({})], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } catch (_) {}
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleFileDrop = useCallback(async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.type === "application/vnd.ms-powerpoint" ||
        droppedFile.name?.endsWith(".pptx"))
    ) {
      setFile(droppedFile);
      await handleFileUpload(droppedFile);
    }
  }, []);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleFileRemove = () => {
    // Cancel upload if in progress
    if (uploading && uploadAbortController.current) {
      uploadAbortController.current.abort();
      setUploading(false);
    }
    setFile(null);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    uploadAbortController.current = new AbortController();

    try {
      const previewUrl = URL.createObjectURL(file);
      const response = await documentService.uploadPdf(file);

      // Check if upload was cancelled
      if (uploadAbortController.current && uploadAbortController.current.signal.aborted) {
        return;
      }

      // Redirect to split view with preview + chat
      navigate("/doc-chat", {
        state: {
          uploadResponse: response,
          initialMessage: "Your document is ready. Ask anything about it!",
          fileName: file.name,
          filePreviewUrl: previewUrl,
        },
        replace: true,
      });
      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Upload cancelled");
        return;
      }
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setUploading(false);
      uploadAbortController.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f7] dark:bg-black text-[#1a1c1f] dark:text-white transition-colors duration-200">
      
      {/* Animated Background for Dark Mode (Subtle) */}
      <div className="hidden dark:block">
        <motion.div
          className="fixed inset-0 opacity-10 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 30%, #95ff00 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 70%, #95ff00 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 30%, #95ff00 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="pt-24 min-h-screen relative z-10">
        {/* Hero Section */}
        <section className="max-w-screen-2xl mx-auto px-8 py-20 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#95ff00]/20 dark:bg-[#95ff00]/20 rounded-full mb-8"
          >
            <span className="material-symbols-outlined text-[#3b6a00] dark:text-[#95ff00] text-sm font-variation-settings-fill-1">auto_awesome</span>
            <span className="text-[#3b6a00] dark:text-[#95ff00] font-bold text-xs tracking-wider uppercase">AI-Powered Analysis</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#1a1c1f] dark:text-white max-w-4xl mb-6"
          >
            Turn Your Documents into <span className="text-[#3b6a00] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#95ff00] dark:to-[#95ff00]">Interactive Conversations</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#605b75] dark:text-gray-400 max-w-2xl mb-16 leading-relaxed"
          >
            Upload your PDFs or PPTs and let WhisperDoc extract the essence. Ask questions, summarize complex topics, and master your material in seconds.
          </motion.p>
          
          {/* Upload Area */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-3xl"
          >
            <div className="relative group">
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                    className="bg-[#ffffff] dark:bg-black/40 dark:backdrop-blur-md rounded-xl p-12 border-2 border-dashed border-[#bfcbae] dark:border-white/20 hover:border-[#3b6a00] dark:hover:border-[#95ff00]/50 transition-all duration-300 flex flex-col items-center justify-center shadow-xl dark:shadow-none overflow-hidden cursor-pointer relative"
                  >
                    {/* Background Glow Decoration */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3b6a00]/10 dark:bg-[#95ff00]/10 blur-3xl rounded-full opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#605b75]/10 dark:bg-primary/10 blur-3xl rounded-full opacity-50"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 bg-[#95ff00] dark:bg-[#95ff00]/20 flex items-center justify-center rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-[#0e2000] dark:text-[#95ff00]" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Drop your files here</h3>
                      <p className="text-[#605b75] dark:text-gray-400 mb-8">Supports PDF, PPTX, and DOCX up to 50MB</p>
                      
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      
                      <button className="bg-[#95ff00] dark:bg-[#95ff00] text-[#0e2000] dark:text-black px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg active:scale-95 transition-all duration-300 flex items-center gap-3">
                        <span className="material-symbols-outlined">add</span>
                        Select Files
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file-selected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#ffffff] dark:bg-[#111111] border border-[#bfcbae] dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center shadow-xl dark:shadow-none"
                  >
                    <div className="flex items-center gap-4 mb-8 bg-[#f3f3f7] dark:bg-white/5 px-6 py-4 rounded-full">
                      <FileText className="w-8 h-8 text-[#3b6a00] dark:text-[#95ff00]" />
                      <span className="font-bold text-lg dark:text-white">{file.name}</span>
                    </div>

                    {!uploading ? (
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleFileUpload(file)}
                          className="bg-[#95ff00] hover:bg-[#81de00] dark:bg-[#95ff00] dark:hover:bg-[#00CC7D] text-[#0e2000] dark:text-black font-bold px-8 py-6 rounded-full text-lg"
                        >
                          Start Analysis
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleFileRemove}
                          className="border-[#ba1a1a] text-[#ba1a1a] dark:border-red-500/50 dark:text-red-400 hover:bg-[#ba1a1a]/10 dark:hover:bg-red-500/10 font-bold px-8 py-6 rounded-full text-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#3b6a00] dark:text-[#95ff00]" />
                        <p className="font-bold text-lg text-[#3b6a00] dark:text-[#95ff00]">Uploading and analyzing document...</p>
                        <p className="text-[#605b75] dark:text-gray-400">Please wait while we extract the knowledge.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ChatBot;
