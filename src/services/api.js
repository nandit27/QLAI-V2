import axios from "axios";

// Debug environment variables
console.log("Environment Variables Debug:");
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("VITE_GEN_PROXY:", import.meta.env.VITE_GEN_PROXY);
console.log("All env vars:", import.meta.env);

const api = axios.create({
  baseURL: import.meta.env.VITE_GEN_PROXY,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Token management utility
const handleTokenExpiry = () => {
  localStorage.removeItem("user-info");
  document.cookie =
    "authtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/";
};

// Maintenance mode handler
const handleMaintenanceMode = (message) => {
  // Store maintenance status in localStorage for components to read
  localStorage.setItem("maintenance-mode", JSON.stringify({
    isMaintenanceMode: true,
    message: message || "The system is currently under maintenance. Please try again later.",
    timestamp: Date.now()
  }));
  
  // Dispatch custom event to notify components about maintenance mode
  window.dispatchEvent(new CustomEvent("maintenance-mode", {
    detail: {
      isMaintenanceMode: true,
      message: message
    }
  }));
};

// Add token interceptor for api instance as well
api.interceptors.request.use(
  (config) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          document.cookie = `authtoken=${token}; path=/`;
        }
      }
    } catch (error) {
      console.error("Error setting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for token expiry handling
api.interceptors.response.use(
  (response) => {
    // Clear maintenance mode if request succeeds
    localStorage.removeItem("maintenance-mode");
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 503) {
        // Server is in maintenance mode
        const message = error.response.data?.message;
        handleMaintenanceMode(message);
      } else if (error.response.status === 401 || error.response.status === 403) {
        // Token expired or unauthorized
        handleTokenExpiry();
      }
    }
    return Promise.reject(error);
  },
);
const url = import.meta.env.VITE_API_URL;
console.log("API_URL:", url);
console.log("GEN_PROXY URL:", import.meta.env.VITE_GEN_PROXY);
const api2 = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Modify the interceptor to handle both token types
api2.interceptors.request.use(
  (config) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          document.cookie = `authtoken=${token}; path=/`;
        }
      }
    } catch (error) {
      console.error("Error setting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for token expiry handling on api2
api2.interceptors.response.use(
  (response) => {
    // Clear maintenance mode if request succeeds
    localStorage.removeItem("maintenance-mode");
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 503) {
        // Server is in maintenance mode
        const message = error.response.data?.message;
        handleMaintenanceMode(message);
      } else if (error.response.status === 401 || error.response.status === 403) {
        // Token expired or unauthorized
        handleTokenExpiry();
      }
    }
    return Promise.reject(error);
  },
);

export const summaryService = {
  generateSummary: async (link, model = 'chatgroq', language = 'en') => {
    try {
      const response = await api2.post("/gen/generate_summary_only", {
        link,
        model,
        language,
      });

      if (response.data && response.data.summary) {
        // Convert the summary object into an array of sentences
        const summaryPoints = Object.entries(response.data.summary).map(
          ([topic, content]) => {
            return `${topic}: ${content}`;
          },
        );

        return summaryPoints;
      } else {
        throw new Error("Summary not found in response");
      }
    } catch (error) {
      console.error("Error in generateSummary:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to generate summary",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const quizService = {
  // Generate only summary for initial display
  generateSummary: async (link, model = 'chatgroq') => {
    try {
      const response = await api2.post("/gen/generate_summary_only", {
        link,
        model,
        language: 'en',
      });
      
      // Validate summary response
      if (!response.data || !response.data.summary) {
        throw new Error("Invalid summary response format from server");
      }

      const summary = response.data.summary;
      
      // Extract topic name
      let topicName =
        summary?.main_topic ||
        response.data.topic_name ||
        response.data.topic;

      // If no direct topic field, try to extract from summary
      if (!topicName && summary) {
        const firstTopicKey = Object.keys(summary)[0];
        topicName = firstTopicKey?.replace("Topic ", "") || "Unknown Topic";
      }

      return {
        summary: summary,
        title: topicName,
        artifact: response.data.artifact ?? "",
      };
    } catch (error) {
      console.error("Error in generateSummary:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to generate summary");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Generate only quiz (to be called when user clicks "Start Quiz")
  generateQuizOnly: async (link, qno, difficulty, model = 'chatgroq') => {
    try {
      const response = await api2.post("/gen/generate_quiz_only", {
        link,
        qno,
        difficulty,
        model,
      });
      
      // Validate quiz response
      if (
        !response.data ||
        !response.data.bloom_quiz ||
        !response.data.bloom_quiz.questions
      ) {
        throw new Error("Invalid quiz response format from server");
      }

      const bloom_quiz = response.data.bloom_quiz;

      return {
        bloom_quiz: bloom_quiz,
        quiz: bloom_quiz.questions, // Extract questions array for consistency
      };
    } catch (error) {
      console.error("Error in generateQuizOnly:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to generate quiz");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Backward compatibility - generates both summary and quiz
  generateQuiz: async (link, qno, difficulty, model = 'chatgroq') => {
    try {
      // Call both endpoints in parallel
      const [summaryResponse, quizResponse] = await Promise.all([
        api2.post("/gen/generate_summary_only", {
          link,
          model,
          language: 'en',
        }),
        api2.post("/gen/generate_quiz_only", {
          link,
          qno,
          difficulty,
          model,
        }),
      ]);
      
      // Validate summary response
      if (!summaryResponse.data || !summaryResponse.data.summary) {
        throw new Error("Invalid summary response format from server");
      }

      // Validate quiz response
      if (
        !quizResponse.data ||
        !quizResponse.data.bloom_quiz ||
        !quizResponse.data.bloom_quiz.questions
      ) {
        throw new Error("Invalid quiz response format from server");
      }

      // Handle all possible ways to get the topic
      const summary = summaryResponse.data.summary;
      const bloom_quiz = quizResponse.data.bloom_quiz;
      
      let topicName =
        summary?.main_topic ||
        quizResponse.data.topic_name ||
        quizResponse.data.topic;

      // If no direct topic field, try to extract from summary
      if (!topicName && summary) {
        // Get the first topic key from summary (e.g., "Topic Life Guidance")
        const firstTopicKey = Object.keys(summary)[0];
        // Extract the topic name after "Topic " prefix
        topicName = firstTopicKey?.replace("Topic ", "") || "Unknown Topic";
      }

      return {
        summary: summary,
        bloom_quiz: bloom_quiz,
        quiz: bloom_quiz.questions, // Extract questions array for consistency
        title: topicName,
      };
    } catch (error) {
      console.error("Error in generateQuiz:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to generate quiz");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const teacherYTQuizService = {
  generateQuiz: async (link, qno, difficulty) => {
    try {
      const response = await api2.post("/gen/teacher_yt_quiz", {
        link,
        qno,
        difficulty,
      });

      if (!response.data || !response.data.bloom_quiz) {
        throw new Error("Invalid response format from server");
      }

      return response.data;
    } catch (error) {
      console.error("Error in teacherYTQuizService:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to generate quiz");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const statisticsService = {
  storeStatistics: async (statisticsData) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { _id, token } = JSON.parse(userInfo);
      if (!_id) {
        throw new Error("User ID not found");
      }
      // Added token to headers
      const response = await api2.post(
        "/user/statistics",
        {
          pasturl: statisticsData.pasturl,
          score: statisticsData.score,
          totalscore: statisticsData.totalscore,
          topic: statisticsData.topic,
          quiz: statisticsData.quiz.questions, // Quiz questions from /quiz API response
          analysis: statisticsData.analysis, // Bloom's taxonomy performance analysis
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Store statistics error:", error);
      throw error;
    }
  },

  getStatistics: async (pageNo = 1) => {
    try {
      // Use api2 instance which already handles the auth header
      const response = await api2.get("/user/showhistory", {
        params: { pageNo },
      });

      console.log("Statistics API response:", response.data);

      // Handle different response formats
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.statistics)) {
        return data.statistics;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn("Unexpected statistics response format:", data);
        return [];
      }
    } catch (error) {
      console.error("Get statistics error:", error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        console.log("No statistics found for user - returning empty array");
        return [];
      } else if (error.response?.status === 401) {
        // Token might be expired
        console.error("Authentication failed - redirecting to login");
        localStorage.removeItem("user-info");
        window.location.href = "/";
        return [];
      }

      throw error;
    }
  },
};

export const recommendationService = {
  getRecommendations: async () => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Use api2 instance with the correct endpoint
      const response = await api2.get("/gen/gen/getonly", {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `authtoken=${token}`,
        },
        withCredentials: true,
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data;
    } catch (error) {
      console.error("Get recommendations error:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch recommendations",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error(error.message || "Error setting up request");
      }
    }
  },
};

export const documentService = {
  uploadPdf: async (file) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Get user token
      const userInfo = localStorage.getItem("user-info");
      let token = null;
      if (userInfo) {
        const { token: userToken } = JSON.parse(userInfo);
        token = userToken;
      }

      // Make request using api2 instance (which points to localhost:3000)

      //upload + authentication token
      const response = await api2.post("/gen/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true,
      });

      // Store upload response and filename for later use
      const uploadData = {
        ...response.data,
        filename:
          response.data.filename ||
          response.data.file_name ||
          response.data.original_name ||
          file.name,
        original_file_name: file.name,
      };
      localStorage.setItem("last-upload-response", JSON.stringify(uploadData));

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to upload file");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  queryDocument: async (query, filename = "", userId = null) => {
    try {
      // Get userId from localStorage if not provided
      let actualUserId = userId;
      if (!actualUserId) {
        const userInfo = localStorage.getItem("user-info");
        console.log("userInfo from localStorage:", userInfo);
        if (userInfo) {
          const { _id } = JSON.parse(userInfo);
          actualUserId = _id;
        }
      }

      // Try to get filename from last upload if not provided
      let actualFilename = filename;
      if (!actualFilename) {
        const lastUpload = localStorage.getItem("last-upload-response");
        if (lastUpload) {
          const uploadData = JSON.parse(lastUpload);
          actualFilename =
            uploadData.filename ||
            uploadData.file_name ||
            uploadData.original_name ||
            "";
        }
      }

      console.log("Query request data:", {
        query,
        filename: actualFilename,
        userId: actualUserId,
      });
      console.log("calling to query")
      const response = await api2.post("/gen/query", {
        query: query,
        filename: actualFilename,
        userId: actualUserId,
      });

      return response.data;
    } catch (error) {
      console.error("Query document error details:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        throw new Error(error.response.data.error || "Failed to process query");
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("No response from server");
      } else {
        console.error("Request setup error:", error.message);
        throw new Error("Error setting up request");
      }
    }
  },

  clearFiles: async () => {
    try {
      const response = await api2.post("/gen/clear_files");
      console.log("Clear files response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Clear files error:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to clear files",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  getUserFiles: async () => {
    try {
      const response = await api2.get("/gen/user_files");
      console.log("Get user files response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get user files error:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to get user files",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

// Add new queryService for direct document querying
export const queryService = {
  queryDocument: async (query, filename = "", userId = null) => {
    try {
      // Get userId from localStorage if not provided
      let actualUserId = userId;
      if (!actualUserId) {
        const userInfo = localStorage.getItem("user-info");
        if (userInfo) {
          const { _id } = JSON.parse(userInfo);
          actualUserId = _id;
        }
      }

      // Try to get filename from last upload if not provided
      let actualFilename = filename;
      if (!actualFilename) {
        const lastUpload = localStorage.getItem("last-upload-response");
        if (lastUpload) {
          const uploadData = JSON.parse(lastUpload);
          actualFilename =
            uploadData.filename ||
            uploadData.file_name ||
            uploadData.original_name ||
            uploadData.original_file_name ||
            "";
        }
      }

      console.log("QueryService request:", {
        query,
        filename: actualFilename,
        userId: actualUserId,
        baseURL: api2.defaults.baseURL,
        endpoint: `${api2.defaults.baseURL}/gen/query`,
        fullURL: `${import.meta.env.VITE_API_URL}/gen/query`,
      });

      // Use api2 instance which handles authentication automatically
      const response = await api2.post("/gen/query", {
        query: query,
        filename: actualFilename,
        userId: actualUserId,
      });

      console.log("QueryService response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Query document error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });
      if (error.response) {
        throw new Error(
          error.response.data.error ||
            `Server error: ${error.response.status} - Failed to process query`,
        );
      } else if (error.request) {
        throw new Error(
          "No response from server - Check if Flask server is running",
        );
      } else {
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
  },
};

export const userService = {
  uploadDoubt: async (data, type) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      const formData = new FormData();

      if (type === "image") {
        formData.append("image", data); // Changed from 'file' to 'image'
      } else {
        formData.append("text", data);
      }
      formData.append("type", type);

      // Get the form data headers
      const formHeaders = {};
      if (type === "image") {
        formHeaders["Content-Type"] = "multipart/form-data";
      }

      const response = await api2.post("/user/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formHeaders,
        },
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(error.response?.data?.error || "Failed to upload doubt");
    }
  },

  matchDoubt: async (doubtId) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await api2.post(
        `/user/doubt/match/${doubtId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      console.log(response);
      return {
        doubtId: response.data.doubtId,
        assignedTeacher: response.data.assignedTeacher,
        onlineteacher: response.data.onlineteacher,
      };
    } catch (error) {
      console.error("Match doubt error:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to match doubt");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const chatService = {
  joinChat: async (doubtId, userId, role) => {
    try {
      if (!doubtId || !userId || !role) {
        throw new Error("Missing required parameters");
      }

      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      const response = await api2.post(
        "/user/chat/join",
        {
          doubtId,
          userId,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Join chat error:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to join chat");
      }
      throw error;
    }
  },

  sendMessage: async (doubtId, sender, message) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      const { token } = JSON.parse(userInfo);
      const response = await api2.post(
        "/user/chat/send",
        {
          doubtId,
          sender,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  },

  getChatHistory: async (doubtId) => {
    try {
      if (!doubtId) {
        throw new Error("Doubt ID is required");
      }
      const userInfo = localStorage.getItem("user-info");
      const { token } = JSON.parse(userInfo);
      const response = await api2.get(`/user/chat/history/${doubtId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get chat history error:", error);
      throw error;
    }
  },
};

export const teacherService = {
  updateRating: async (teacherId, rating) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      const response = await api2.post(
        "/user/rating",
        {
          teacherId,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Update rating error:", error);
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to update rating");
      }
      throw error;
    }
  },

  getRating: async (teacherId) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      const response = await api2.get(`/user/teacher/${teacherId}/rating`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get rating error:", error);
      throw error;
    }
  },
};

export const quizRoomService = {
  createQuiz: async (topic, numQuestions, difficulty, customBreakdown) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      console.log("Creating quiz with:", { topic, numQuestions, difficulty, customBreakdown });
      
      const payload = {
        topics: topic,  // Changed from 'topic' to 'topics' to match backend
        num_questions: numQuestions,
        difficulty,
      };
      
      if (customBreakdown) {
        payload.custom_breakdown = customBreakdown;
      }
      
      const response = await api2.post(
        "/gen/llm_quiz",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Create quiz error:", error);
      throw error;
    }
  },
};

export const youtubeChatService = {
  askQuestion: async (link, model, question) => {
    try {
      const response = await api2.post("/gen/chat_trans", {
        link,
        model,
        question,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || "Failed to get answer");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const doubtService = {
  markDoubtAsResolved: async (doubtId) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      const response = await api2.patch(
        `/user/doubt/${doubtId}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Mark doubt resolved error:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to mark doubt as resolved",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const paperService = {
  uploadPaper: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api2.post("/gen/paper_upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(error.response?.data?.error || "Failed to upload file");
    }
  },

  generatePaper: async (filePath, numQuestions, numPapers) => {
    try {
      const response = await api2.post("/gen/generate_paper", {
        file_path: filePath,
        num_questions: numQuestions,
        num_papers: numPapers,
      });

      return response.data;
    } catch (error) {
      console.error("Generation error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to generate papers",
      );
    }
  },

  downloadPaper: async (paperInfo) => {
    try {
      // Since files are generated on the server, we need a download endpoint
      const response = await api2.get(`/gen/download_paper`, {
        params: {
          file_path: paperInfo.path,
        },
        responseType: "blob",
      });

      return response.data;
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("Failed to download paper");
    }
  },
};

export const paymentService = {
  createOrder: async (orderData) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await api2.post(
        "/user/api/payment",
        {
          membershipType: orderData.membershipType,
          name: orderData.name,
          email: orderData.email,
          contact: orderData.contact,
          duration: 30, // Default duration in days
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Order Creation Response:", response.data);

      // Check if the response has the required fields
      if (!response.data || !response.data.order_id) {
        console.error("Invalid order response structure:", response.data);
        throw new Error("Invalid order response from server");
      }

      // Return formatted order data
      return {
        id: response.data.order_id,
        amount: response.data.amount || 0,
        currency: response.data.currency || "INR",
        description:
          response.data.description ||
          `${orderData.membershipType} Membership - 30 days`,
        notes: {
          membershipType: orderData.membershipType,
          duration: 30, // Default duration in days
          name: orderData.name,
          email: orderData.email,
          contact: orderData.contact,
        },
      };
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      // console.log('Payment data:', paymentData);
      const { token } = JSON.parse(userInfo);
      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Verifying payment with data:", paymentData);

      const response = await api2.post(
        "/user/api/verifypayment",
        {
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
          membership: paymentData.membership,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Verification response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Verify payment error:", error);
      throw error;
    }
  },
};

export const questionBankService = {
  generateQuestionBank: async (topic) => {
    try {
      const response = await api2.post(
        "/gen/question_bank",
        { topic },
        {
          responseType: "blob", // Important: Set response type to blob for binary data
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Create and save the PDF file
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${topic.replace(/\s+/g, "_")}_Questions.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Question bank generation error:", error);
      if (error.response) {
        // Handle error response
        if (error.response.data instanceof Blob) {
          // If error response is also a blob, try to read it as text
          const text = await error.response.data.text();
          try {
            const errorObj = JSON.parse(text);
            throw new Error(
              errorObj.error || "Failed to generate question bank",
            );
          } catch {
            throw new Error("Failed to generate question bank");
          }
        } else {
          throw new Error(
            error.response.data.error || "Failed to generate question bank",
          );
        }
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const youtubeService = {
  getVideoRecommendations: async (topics) => {
    try {
      const response = await api2.post(`/gen/youtube_videos`, {
        topic: Array.isArray(topics) ? topics : [topics],
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Handle different response structures
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data.videos) {
        return response.data.videos;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        // If it's a direct object mapping
        return response.data;
      }
    } catch (error) {
      console.error("Error getting video recommendations:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to get video recommendations",
        );
      } else if (error.request) {
        throw new Error("No response received from server");
      } else {
        throw error;
      }
    }
  },
};

export const adminService = {
  // Create an axios instance for admin requests
  api: axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  }),

  // Method to get all orders
  getOrders: async () => {
    try {
      // Get the auth token from localStorage
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch orders",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Add this new method
  getOrderStats: async () => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/orders/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching order stats:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch order statistics",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Add this new method for pending teachers
  getPendingTeachers: async () => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/teachers/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching pending teachers:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch pending teachers",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  handleTeacherRequest: async (teacherId, action, reason) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/teachers/handle-request`,
        {
          teacherId,
          action, // 'approve' or 'reject'
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error handling teacher request:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to process teacher request",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Method to get new student registrations
  getNewStudents: async () => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/new-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching new students:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch new students",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Method to get maintenance status
  getMaintenanceStatus: async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/maintenance/status`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch maintenance status",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Method to toggle maintenance mode
  toggleMaintenanceMode: async (isMaintenanceMode, message) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/maintenance/toggle`,
        {
          isMaintenanceMode,
          message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to toggle maintenance mode",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Method to get all teachers
  getAllTeachers: async () => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/teachers/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching all teachers:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch all teachers",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Method to update teacher details
  updateTeacherDetails: async (teacherId, updates) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/teachers/update`,
        {
          teacherId,
          updates,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error updating teacher:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to update teacher",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  // Method to add new teacher
  addNewTeacher: async (teacherData) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/teachers/create`,
        teacherData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error adding teacher:", error);
      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to add teacher",
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },
};

export const mindMapService = {
  generateMindMap: async (videoUrl) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }
      const { token } = JSON.parse(userInfo);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/gen/generate_mind_map`,
        { video_url: videoUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      // Handle different response structures
      if (response.data.error && response.data.error.includes("{")) {
        const parts = response.data.error.split("JSON format:");
        if (parts.length > 1 && parts[1]) {
          try {
            const jsonStr = parts[1].trim();
            return JSON.parse(jsonStr);
          } catch (parseError) {
            console.error("Error parsing JSON from error message:", parseError);
            throw new Error("Invalid JSON format in response");
          }
        } else {
          throw new Error("No valid JSON found in error message");
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error generating mind map:", error);
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Failed to generate mind map";

        if (statusCode === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (statusCode === 403) {
          throw new Error(
            "Access denied. You don't have permission to generate mind maps.",
          );
        } else if (statusCode === 400) {
          throw new Error(`Invalid request: ${errorMessage}`);
        } else if (statusCode >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(errorMessage);
        }
      } else if (error.request) {
        throw new Error(
          "No response from server. Please check your connection and try again.",
        );
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  },
};

export const docChatService = {
  queryDocument: async (query, filename, userId) => {
    try {
      console.log("DocChat service - Making query request with:", { 
        query, 
        filename, 
        userId,
        baseURL: api2.defaults.baseURL,
        endpoint: "/gen/query"
      });
      
      const response = await api2.post("/gen/query", {
        query: query,
        filename: filename,
        userId: userId,
      });

      console.log("DocChat service - Query response:", response.data);
      return response.data;
    } catch (error) {
      console.error("DocChat service - Query error:", error);
      console.error("DocChat service - Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      
      if (error.response) {
        throw new Error(
          error.response.data.error || 
          `Server error: ${error.response.status} - Failed to process document query`
        );
      } else if (error.request) {
        throw new Error("No response from server - Check if the API server is running");
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  },

  clearFiles: async () => {
    try {
      const response = await api2.post("/gen/clear_files");
      return response.data;
    } catch (error) {
      console.error("DocChat service - Clear files error:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to clear files"
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  },

  getUserFiles: async () => {
    try {
      const response = await api2.get("/gen/user_files");
      return response.data;
    } catch (error) {
      console.error("DocChat service - Get user files error:", error);
      if (error.response) {
        throw new Error(
          error.response.data.error || "Failed to get user files"
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Error setting up request");
      }
    }
  }
};

// Document Quiz Service - for generating quizzes from uploaded documents
export const documentQuizService = {
  uploadDocument: async (file) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { _id } = JSON.parse(userInfo);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userid', _id);

      const response = await api2.post('/gen/upload_document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload document response:', response.data);
      if (!response.data || !response.data.document_id) {
        throw new Error('Invalid response from server');
      }

      return {
        documentId: response.data.document_id,
        filename: response.data.file_name || response.data.filename,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Upload document error:', error);
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data?.error || error.response.data?.message || 'Failed to upload document');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Other errors
        throw error;
      }
    }
  },

  generateQuizFromDocument: async (documentId, numQuestions, difficulty, model) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { _id } = JSON.parse(userInfo);

      const response = await api2.post('/gen/generate_quiz', {
        document_id: documentId,
        user_id: _id,
        num_questions: numQuestions,
        difficulty: difficulty,
        model: model,
      });

      if (!response.data || !response.data.bloom_quiz) {
        throw new Error('Invalid quiz response from server');
      }

      return {
        summary: response.data.summary,
        bloom_quiz: response.data.bloom_quiz,
        title: response.data.summary?.main_topic || response.data.topic_name || 'Document Quiz',
      };
    } catch (error) {
      console.error('Generate quiz from document error:', error);
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data?.error || error.response.data?.message || 'Failed to generate quiz from document');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Other errors
        throw error;
      }
    }
  },
};

export const documentBloomQuizService = {
  uploadDocument: async (file) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { _id } = JSON.parse(userInfo);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userid', _id);

      const response = await api2.post('/gen/upload_document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload document response:', response.data);
      if (!response.data || !response.data.document_id) {
        throw new Error('Invalid response from server');
      }

      return {
        documentId: response.data.document_id,
        filename: response.data.file_name || response.data.filename,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Upload document error:', error);
      if (error.response) {
        throw new Error(error.response.data?.error || error.response.data?.message || 'Failed to upload document');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw error;
      }
    }
  },

  generateQuizFromDocument: async (documentId, numQuestions, difficulty) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { _id } = JSON.parse(userInfo);

      const response = await api2.post('/gen/generate_bloom_quiz', {
        document_id: documentId,
        userid: _id,
        num_questions: numQuestions,
        difficulty: difficulty,
        model: 'chatgroq',
      });

      if (!response.data || !response.data.bloom_quiz) {
        throw new Error('Invalid quiz response from server');
      }

      return response.data;
    } catch (error) {
      console.error('Generate quiz from document error:', error);
      if (error.response) {
        throw new Error(error.response.data?.error || error.response.data?.message || 'Failed to generate quiz from document');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw error;
      }
    }
  },
};

// Quiz Record Service
export const quizRecordService = {
  // ── Save a quiz as a draft (no socket / roomId yet) ────────────────────────
  saveDraftQuiz: async (teacherId, quizData, title = '') => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) throw new Error("User not authenticated");
      const { token } = JSON.parse(userInfo);

      const response = await api2.post(
        '/quiz-record/save-draft',
        { teacherId, quizData, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Save draft quiz error:', error);
      throw error.response?.data || error;
    }
  },

  // ── Fetch all draft quizzes for a teacher ──────────────────────────────────
  getDraftQuizzes: async (teacherId, page = 1, limit = 20) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) throw new Error("User not authenticated");
      const { token } = JSON.parse(userInfo);

      const response = await api2.get(`/quiz-record/teacher/${teacherId}/drafts`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Get draft quizzes error:', error);
      throw error.response?.data || error;
    }
  },

  // ── Update an existing draft (edit flow from dashboard) ────────────────────
  updateDraftQuiz: async (recordId, quizData, title = '') => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) throw new Error("User not authenticated");
      const { token, _id: teacherId } = JSON.parse(userInfo);

      const response = await api2.put(
        `/quiz-record/${recordId}/draft`,
        { teacherId, quizData, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Update draft quiz error:', error);
      throw error.response?.data || error;
    }
  },

  // ── Share a saved draft: backend assigns roomId, loads Redis, marks live ───
  shareQuizFromDraft: async (recordId, teacherId) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) throw new Error("User not authenticated");
      const { token } = JSON.parse(userInfo);

      const response = await api2.post(
        `/quiz-record/${recordId}/share`,
        { teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // { roomId, quizRecord }
    } catch (error) {
      console.error('Share quiz from draft error:', error);
      throw error.response?.data || error;
    }
  },

  // Get all quiz records for a teacher
  getTeacherQuizRecords: async (teacherId, page = 1, limit = 10) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);

      const response = await api2.get(`/quiz-record/teacher/${teacherId}`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Get quiz records error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete a quiz record by ID
  deleteQuizRecord: async (recordId) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) throw new Error("User not authenticated");
      const { token } = JSON.parse(userInfo);

      const response = await api2.delete(`/quiz-record/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Delete quiz record error:', error);
      throw error.response?.data || error;
    }
  },

  // Get a specific quiz record by ID
  getQuizRecordById: async (recordId) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);

      const response = await api2.get(`/quiz-record/${recordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Get quiz record error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete a quiz record
  deleteQuizRecord: async (recordId) => {
    try {
      const userInfo = localStorage.getItem("user-info");
      if (!userInfo) {
        throw new Error("User not authenticated");
      }

      const { token } = JSON.parse(userInfo);

      const response = await api2.delete(`/quiz-record/${recordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Delete quiz record error:', error);
      throw error.response?.data || error;
    }
  },
};

