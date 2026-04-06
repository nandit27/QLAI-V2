import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { statisticsService, youtubeService } from "@/services/api";
import { CountUp } from "@/components/ui/count-up";
import {
  Trophy,
  Target,
  BookOpen,
  Clock,
  ArrowUp,
  ArrowDown,
  Play,
  ExternalLink,
} from "lucide-react";

const ProfilePage = () => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [lastFetchedTopics, setLastFetchedTopics] = useState([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getStatistics();
        console.log("Fetched statistics data:", data); // Debug log

        // Ensure data is an array and handle different response formats
        const statsArray = Array.isArray(data) ? data : data?.statistics || [];
        setStatistics(statsArray);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        setError(error.message || "Failed to load statistics");
        setStatistics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Fetch recommendations for last 3 unique topics
  const fetchRecommendations = useCallback(
    async (currentTopics) => {
      if (!currentTopics.length) return;

      // Check if we need to fetch new recommendations
      const topicsToFetch = currentTopics.filter(
        (topic) => !lastFetchedTopics.includes(topic),
      );

      if (topicsToFetch.length === 0) return; // No new topics to fetch

      setLoadingRecommendations(true);
      try {
        const videoData =
          await youtubeService.getVideoRecommendations(topicsToFetch);

        if (videoData && typeof videoData === "object") {
          const processedRecommendations = [];

          // Handle different possible response structures
          if (Array.isArray(videoData)) {
            // If it's an array, try to map it to topics
            topicsToFetch.forEach((topic, index) => {
              if (videoData[index]) {
                processedRecommendations.push({
                  topic,
                  videos: Array.isArray(videoData[index])
                    ? videoData[index]
                    : [videoData[index]],
                });
              }
            });
          } else if (videoData.data) {
            // If it has a data property
            for (const [topic, videos] of Object.entries(videoData.data)) {
              if (Array.isArray(videos) && videos.length > 0) {
                processedRecommendations.push({ topic, videos });
              }
            }
          } else {
            // Direct object mapping
            for (const [topic, videos] of Object.entries(videoData)) {
              if (Array.isArray(videos) && videos.length > 0) {
                processedRecommendations.push({ topic, videos });
              }
            }
          }

          setRecommendations((prev) => {
            // Merge new recommendations with existing ones, avoiding duplicates
            const merged = [...prev];
            processedRecommendations.forEach((newRec) => {
              const existingIndex = merged.findIndex(
                (rec) => rec.topic === newRec.topic,
              );
              if (existingIndex >= 0) {
                merged[existingIndex] = newRec;
              } else {
                merged.push(newRec);
              }
            });
            return merged.slice(0, 3); // Keep only last 3 topics
          });

          setLastFetchedTopics((prev) => [
            ...new Set([...prev, ...topicsToFetch]),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        // Don't block dashboard - just fail silently for recommendations
      } finally {
        setLoadingRecommendations(false);
      }
    },
    [lastFetchedTopics],
  );

  // Effect to fetch recommendations when statistics change
  useEffect(() => {
    if (statistics.length > 0) {
      // Get last 3 unique topics from statistics
      const uniqueTopics = [
        ...new Set(
          statistics
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((stat) => stat.topic),
        ),
      ].slice(0, 3);

      fetchRecommendations(uniqueTopics);
    }
  }, [statistics, fetchRecommendations]);

  // Retrieve user info from local storage
  const userInfo = localStorage.getItem("user-info")
    ? JSON.parse(localStorage.getItem("user-info"))
    : {};
  const avatar = userInfo.avatar || "/default-avatar.png";
  const name = String(userInfo.username);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 mt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header Skeleton */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-8 w-64 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Quick Stats Skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-400/10 rounded-full">
                    <div className="h-6 w-6 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 w-20 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-12 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#95ff00]"></div>
            <span className="ml-3 text-gray-400">
              Loading your dashboard...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Remove error blocking - always show dashboard

  // Calculate statistics with safe defaults
  const totalQuizzes = statistics.length;
  const averageScore =
    statistics.length > 0
      ? Math.round(
          statistics.reduce(
            (acc, stat) => acc + (stat.score / stat.totalscore) * 100,
            0,
          ) / totalQuizzes,
        )
      : 0;

  // Calculate best score safely
  const bestScore =
    statistics.length > 0
      ? Math.max(
          ...statistics.map((stat) =>
            Math.round((stat.score / stat.totalscore) * 100),
          ),
        )
      : 0;

  // Prepare data for charts
  const scoreHistory = statistics
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((stat) => ({
      date: new Date(stat.createdAt).toLocaleDateString(),
      score: Math.round((stat.score / stat.totalscore) * 100),
      topic: stat.topic,
    }));

  const topicDistribution = Array.from(
    new Set(statistics.map((stat) => stat.topic)),
  ).map((topic) => {
    const topicStats = statistics.filter((stat) => stat.topic === topic);
    return {
      topic,
      count: topicStats.length,
      averageScore: Math.round(
        topicStats.reduce(
          (acc, stat) => acc + (stat.score / stat.totalscore) * 100,
          0,
        ) / topicStats.length,
      ),
    };
  });

  const COLORS = ["#95ff00", "#00E5FF", "#00BFFF", "#009BFF", "#0077FF"];

  // Get performance trends
  const recentScores = scoreHistory.slice(-2);
  const scoreTrend =
    recentScores.length > 1 ? recentScores[1].score - recentScores[0].score : 0;

  return (
    <div className="min-h-screen bg-black text-white p-8 mt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-emerald-400/10 text-emerald-400">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {name}&apos;s Dashboard
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your learning analytics and progress
                </CardDescription>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">
                  <CountUp key={totalQuizzes} to={totalQuizzes} duration={2} />
                </p>
                <p className="text-sm text-gray-400">Quizzes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">
                  <CountUp key={averageScore} to={averageScore} suffix="%" duration={2} />
                </p>
                <p className="text-sm text-gray-400">Avg. Score</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats Cards - Above Analytics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-400/10 rounded-full">
                  <Trophy className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Best Score</p>
                  <p className="text-2xl font-bold">
                    <CountUp key={bestScore} to={bestScore} suffix="%" duration={2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-400/10 rounded-full">
                  <Target className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Recent Trend</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">
                      <CountUp
                        key={scoreTrend}
                        to={statistics.length > 1 ? Math.abs(scoreTrend) : 0}
                        suffix="%"
                        duration={2}
                      />
                    </p>
                    {statistics.length > 1 &&
                      scoreTrend !== 0 &&
                      (scoreTrend > 0 ? (
                        <ArrowUp className="ml-2 h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4 text-red-500" />
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-400/10 rounded-full">
                  <BookOpen className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Topics Covered</p>
                  <p className="text-2xl font-bold">
                    <CountUp
                      key={Array.from(new Set(statistics.map((stat) => stat.topic))).length}
                      to={Array.from(new Set(statistics.map((stat) => stat.topic))).length}
                      duration={2}
                    />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-400/10 rounded-full">
                  <Clock className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Study Sessions</p>
                  <p className="text-2xl font-bold">
                    <CountUp key={statistics.length} to={statistics.length} duration={2} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="w-full bg-black/40 border border-white/10 p-2 rounded-xl grid grid-cols-3 h-14">
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#95ff00]/20 data-[state=active]:to-[#95ff00]/30 data-[state=active]:text-[#95ff00] data-[state=active]:border data-[state=active]:border-[#95ff00]/50 data-[state=active]:shadow-lg data-[state=active]:shadow-[#95ff00]/25 rounded-lg transition-all duration-300 font-medium hover:bg-[#95ff00]/10"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="topics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#95ff00]/20 data-[state=active]:to-[#95ff00]/30 data-[state=active]:text-[#95ff00] data-[state=active]:border data-[state=active]:border-[#95ff00]/50 data-[state=active]:shadow-lg data-[state=active]:shadow-[#95ff00]/25 rounded-lg transition-all duration-300 font-medium hover:bg-[#95ff00]/10"
            >
              Topics
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#95ff00]/20 data-[state=active]:to-[#95ff00]/30 data-[state=active]:text-[#95ff00] data-[state=active]:border data-[state=active]:border-[#95ff00]/50 data-[state=active]:shadow-lg data-[state=active]:shadow-[#95ff00]/25 rounded-lg transition-all duration-300 font-medium hover:bg-[#95ff00]/10"
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
              </div>
            ) : statistics.length === 0 ? (
              <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                <CardContent className="text-center py-16">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-4">
                    No Performance Data Yet
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Start taking quizzes to see your performance analytics and
                    track your progress over time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-emerald-400">
                      Score Progression
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scoreHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#000000",
                              border: "1px solid #ffffff20",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#95ff00"
                            strokeWidth={3}
                            dot={{ fill: "#95ff00", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: "#95ff00" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-emerald-400">
                      Performance by Topic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis
                            dataKey="topic"
                            stroke="#666"
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#000000",
                              border: "1px solid #ffffff20",
                            }}
                          />
                          <Bar dataKey="averageScore" fill="#95ff00" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="topics">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
              </div>
            ) : statistics.length === 0 ? (
              <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                <CardContent className="text-center py-16">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-4">
                    No Topics Explored Yet
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Take quizzes across different topics to see your topic
                    distribution and performance insights.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-emerald-400">
                      Topic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topicDistribution}
                            dataKey="count"
                            nameKey="topic"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ topic, percent }) =>
                              `${topic}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {topicDistribution.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#000000",
                              border: "1px solid #ffffff20",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-emerald-400">
                      Topic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topicDistribution.map((topic, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{topic.topic}</span>
                            <span className="text-emerald-400">
                              {topic.averageScore}%
                            </span>
                          </div>
                          <Progress
                            value={topic.averageScore}
                            className="h-2 bg-black/50"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-emerald-400">Quiz History</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      No quiz history available yet.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Take a quiz to see your progress here!
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-emerald-400">Date</TableHead>
                        <TableHead className="text-emerald-400">
                          Topic
                        </TableHead>
                        <TableHead className="text-emerald-400">
                          Score
                        </TableHead>
                        <TableHead className="text-emerald-400">
                          Trend
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt),
                        )
                        .map((stat, index, arr) => {
                          const currentScore = Math.round(
                            (stat.score / stat.totalscore) * 100,
                          );
                          const previousScore =
                            index < arr.length - 1
                              ? Math.round(
                                  (arr[index + 1].score /
                                    arr[index + 1].totalscore) *
                                    100,
                                )
                              : currentScore;
                          const trend = currentScore - previousScore;

                          return (
                            <TableRow key={index} className="border-white/10">
                              <TableCell className="text-gray-300">
                                {new Date(stat.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {stat.topic}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {currentScore}%
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {trend !== 0 &&
                                    (trend > 0 ? (
                                      <ArrowUp className="mr-2 h-4 w-4 text-green-500" />
                                    ) : (
                                      <ArrowDown className="mr-2 h-4 w-4 text-red-500" />
                                    ))}
                                  <span
                                    className={
                                      trend > 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }
                                  >
                                    {trend !== 0 ? `${Math.abs(trend)}%` : "-"}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Video Recommendations Section */}
        {recommendations.length > 0 && (
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                YouTube Video Recommendations
              </CardTitle>
              <CardDescription className="text-gray-400">
                Based on your recent quiz topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRecommendations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
                  <span className="ml-2 text-gray-400">
                    Loading recommendations...
                  </span>
                </div>
              ) : (
                <div className="space-y-8">
                  {recommendations.slice(0, 3).map((topicData, topicIndex) => (
                    <div key={topicIndex} className="space-y-4">
                      <h3 className="text-2xl font-semibold text-white capitalize">
                        {topicData.topic.replace(/[_-]/g, " ")}
                      </h3>
                      {Array.isArray(topicData.videos) &&
                      topicData.videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {topicData.videos.map((videoUrl, videoIndex) => {
                            const videoId = videoUrl.match(
                              /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                            )?.[1];

                            if (!videoId) return null;

                            return (
                              <div
                                key={videoIndex}
                                className="group hover:scale-105 transition-all duration-300"
                              >
                                <a
                                  href={videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <div className="bg-black/50 rounded-xl overflow-hidden border border-zinc-800/50">
                                    <div className="relative">
                                      <img
                                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                        alt={`${topicData.topic} video ${videoIndex + 1}`}
                                        className="w-full aspect-video object-cover"
                                        onError={(e) => {
                                          e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-[#95ff00]/10 group-hover:bg-transparent transition-colors duration-300" />
                                    </div>
                                    <div className="p-4">
                                      <h4 className="text-lg font-medium text-gray-200 group-hover:text-[#95ff00] transition-colors duration-300">
                                        {topicData.topic.replace(/[_-]/g, " ")}{" "}
                                        - Video {videoIndex + 1}
                                      </h4>
                                    </div>
                                  </div>
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No videos available for this topic
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
