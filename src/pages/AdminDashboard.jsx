import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  UserCheck,
  UserPlus,
  TrendingUp,
  Calendar,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";
import { adminService } from "../services/api";
import { maintenanceService } from "../services/maintenanceService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TeacherEditModal from "../components/TeacherEditModal";
import TeacherAddModal from "../components/TeacherAddModal";

import { Button } from "../components/ui/Button";

const StatCard = ({ title, value, icon: Icon }) => (
  <Card className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#95ff00]/30 transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">
            {typeof value === "number" ? (
              <CountUp key={value} to={value} duration={2} />
            ) : (
              value
            )}
          </h3>
        </div>
        <div className="h-12 w-12 rounded-lg bg-[#95ff00]/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-[#95ff00]" />
        </div>
      </div>
    </CardContent>
  </Card>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
};

const AdminDashboard = () => {
  const [newStudents, setNewStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("The server is currently under maintenance. Please try again later.");
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("user-info");
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const { role } = JSON.parse(userInfo);
    if (role !== "admin") {
      navigate("/");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch orders data with error handling
    try {
      const ordersData = await adminService.getOrders();
      setOrders(ordersData.orders || []);
    } catch (ordersError) {
      console.error("Error fetching orders:", ordersError);
      setOrders([]);
    }

    // Fetch stats data with error handling
    try {
      const statsData = await adminService.getOrderStats();
      console.log("Order stats:", statsData); // Log for debugging but don't store unused data
    } catch (statsError) {
      console.error("Error fetching stats:", statsError);
    }

    // Fetch pending teachers data with error handling
    try {
      const teachersData = await adminService.getPendingTeachers();
      console.log("Pending Teachers Response:", teachersData);

      if (teachersData && teachersData.pendingTeachers) {
        setPendingTeachers(teachersData.pendingTeachers);
      } else {
        console.error("No pending teachers data:", teachersData);
        setPendingTeachers([]);
      }
    } catch (teachersError) {
      console.error("Error fetching pending teachers:", teachersError);
      setPendingTeachers([]);
    }

    // Fetch new student registrations with error handling
    try {
      const studentsData = await adminService.getNewStudents();
      setNewStudents(studentsData.students || []);
    } catch (studentsError) {
      console.error("Error fetching new students:", studentsError);
      setNewStudents([]);
    }

    // Fetch all teachers with error handling
    try {
      const allTeachersData = await adminService.getAllTeachers();
      setAllTeachers(allTeachersData.teachers || []);
    } catch (teachersError) {
      console.error("Error fetching all teachers:", teachersError);
      setAllTeachers([]);
    }

    setLoading(false);
  };

  const handleTeacherAction = async (teacherId, action) => {
    if (action === "approve") {
      setSelectedTeacher(teacherId);
      setShowApprovalModal(true);
    } else {
      await processTeacherRequest(teacherId, "reject", "Not qualified");
    }
  };

  const processTeacherRequest = async (teacherId, action, reason) => {
    try {
      setIsProcessing(true);
      await adminService.handleTeacherRequest(teacherId, action, reason);

      // Update the local state to remove the processed teacher
      setPendingTeachers((prev) =>
        prev.filter((teacher) => teacher._id !== teacherId),
      );

      toast.success(
        `Teacher ${action === "approve" ? "approved" : "rejected"} successfully`,
      );
      setShowApprovalModal(false);
      setSelectedTeacher(null);
      setApprovalReason("");
      
      // Refresh all teachers list
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setShowEditModal(true);
  };

  const handleUpdateTeacher = async (teacherId, updates) => {
    try {
      await adminService.updateTeacherDetails(teacherId, updates);
      toast.success("Teacher updated successfully");
      setShowEditModal(false);
      setEditingTeacher(null);
      fetchData(); // Refresh the teachers list
    } catch (error) {
      toast.error(error.message || "Failed to update teacher");
      throw error;
    }
  };

  const handleAddTeacher = async (teacherData) => {
    try {
      await adminService.addNewTeacher(teacherData);
      toast.success("Teacher added successfully");
      setShowAddModal(false);
      fetchData(); // Refresh the teachers list
    } catch (error) {
      toast.error(error.message || "Failed to add teacher");
      throw error;
    }
  };

  // Fetch maintenance status
  const fetchMaintenanceStatus = async () => {
    try {
      const data = await maintenanceService.getStatus();
      if (data.success) {
        setMaintenanceMode(data.isMaintenanceMode);
        setMaintenanceMessage(data.message);
      }
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
    }
  };

  // Toggle maintenance mode
  const toggleMaintenanceMode = async () => {
    try {
      const data = await maintenanceService.toggleMode(!maintenanceMode, maintenanceMessage);
      if (data.success) {
        setMaintenanceMode(!maintenanceMode);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      toast.error(error.message || "Failed to toggle maintenance mode");
    }
  };

  // Load maintenance status on component mount
  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  // Approval Modal Component
  const ApprovalModal = () => {
    const textareaRef = useRef(null);

    useEffect(() => {
      if (showApprovalModal && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, []);

    if (!showApprovalModal) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold text-[#95ff00] mb-4">
            Approve Teacher
          </h3>
          <textarea
            ref={textareaRef}
            value={approvalReason}
            onChange={(e) => setApprovalReason(e.target.value)}
            placeholder="Enter approval reason..."
            className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white mb-4 focus:outline-none focus:border-[#95ff00]"
            rows="3"
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) =>
              e.currentTarget.setSelectionRange(
                e.currentTarget.value.length,
                e.currentTarget.value.length,
              )
            }
          />
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => {
                setShowApprovalModal(false);
                setSelectedTeacher(null);
                setApprovalReason("");
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                processTeacherRequest(
                  selectedTeacher,
                  "approve",
                  approvalReason,
                )
              }
              className="px-4 py-2 bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] rounded-lg hover:bg-[#95ff00]/20"
              disabled={isProcessing || !approvalReason.trim()}
              variant="ghost"
              size="icon">
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#95ff00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#95ff00] via-[#95ff00] to-blue-400 bg-clip-text text-transparent mb-4">
            Admin Control Center
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your platform with comprehensive insights and controls
          </p>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="New Students"
            value={newStudents.length}
            icon={UserPlus}
          />
          <StatCard
            title="Teacher Requests"
            value={pendingTeachers.length}
            icon={UserCheck}
          />
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={DollarSign}
          />
          <StatCard
            title="Revenue"
            value={`₹${orders.length > 0 ? orders.reduce((sum, order) => sum + (order.amount || 0) / 100, 0) : 0}`}
            icon={TrendingUp}
          />
        </motion.div>

        {/* Enhanced Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-[#95ff00]/20 data-[state=active]:text-[#95ff00]"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-[#95ff00]/20 data-[state=active]:text-[#95ff00]"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                New Students
              </TabsTrigger>
              <TabsTrigger
                value="teachers"
                className="data-[state=active]:bg-[#95ff00]/20 data-[state=active]:text-[#95ff00]"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Teacher Requests
              </TabsTrigger>
              <TabsTrigger
                value="allteachers"
                className="data-[state=active]:bg-[#95ff00]/20 data-[state=active]:text-[#95ff00]"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                All Teachers
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-[#95ff00]/20 data-[state=active]:text-[#95ff00]"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="data-[state=active]:bg-[#95ff00]/20 data-[state=active]:text-[#95ff00]"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Maintenance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <motion.div
                key="overview-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Recent Activity */}
                <Card className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#95ff00]/30 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#95ff00] flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {newStudents.slice(0, 3).map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{student.username}</p>
                            <p className="text-sm text-gray-400">
                              Registered{" "}
                              {new Date(
                                student.registrationDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm text-[#95ff00]">New User</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#95ff00]/30 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#95ff00] flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Completed Orders</span>
                        <span className="text-green-400 font-semibold">
                          <CountUp
                            key={orders.length}
                            to={orders.length > 0
                              ? orders.filter((order) => order.status === "completed").length
                              : 0}
                            duration={2}
                          />
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Pending Approvals</span>
                        <span className="text-yellow-400 font-semibold">
                          <CountUp key={pendingTeachers.length} to={pendingTeachers.length} duration={2} />
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Students</span>
                        <span className="text-blue-400 font-semibold">
                          <CountUp key={newStudents.length} to={newStudents.length} duration={2} />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="students">
              <motion.div
                key="students-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#95ff00] flex items-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      New Student Registrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead className="text-[#95ff00]">
                              Student Name
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Email
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Registration Date
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Login Count
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newStudents.map((student) => (
                            <TableRow
                              key={student._id}
                              className="border-white/10 hover:bg-white/5"
                            >
                              <TableCell className="text-gray-300 font-medium">
                                {student.username}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {student.email}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {new Date(
                                  student.registrationDate,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                  {student.loginCount} logins
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  className="bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {newStudents.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          No new student registrations
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="teachers">
              <motion.div
                key="teachers-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#95ff00] flex items-center">
                      <UserCheck className="w-5 h-5 mr-2" />
                      Teacher Approval Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead className="text-[#95ff00]">
                              Name
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Email
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Qualification
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Experience
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Subjects
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingTeachers && pendingTeachers.length > 0 ? (
                            pendingTeachers.map((teacher) => (
                              <TableRow
                                key={teacher._id}
                                className="border-white/10 hover:bg-white/5"
                              >
                                <TableCell className="text-gray-300">
                                  <div className="flex items-center space-x-3">
                                    {teacher.avatar && (
                                      <img
                                        src={teacher.avatar}
                                        alt={teacher.username}
                                        className="w-8 h-8 rounded-full"
                                      />
                                    )}
                                    <span className="font-medium">
                                      {teacher.username}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {teacher.email}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {teacher.highestQualification}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                    {teacher.experience} years
                                  </span>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  <div className="flex flex-wrap gap-1">
                                    {Array.isArray(teacher.subject) &&
                                      teacher.subject.map((sub, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 text-xs bg-[#95ff00]/20 text-[#95ff00] rounded-full border border-[#95ff00]/30"
                                        >
                                          {sub.field}
                                        </span>
                                      ))}
                                  </div>
                                </TableCell>
                                <TableCell className="space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleTeacherAction(
                                        teacher._id,
                                        "approve",
                                      )
                                    }
                                    className="bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleTeacherAction(teacher._id, "reject")
                                    }
                                    className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
                                  >
                                    Reject
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center text-gray-400 py-8"
                              >
                                No pending teacher requests
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="allteachers">
              <motion.div
                key="allteachers-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-[#95ff00] flex items-center">
                      <UserCheck className="w-5 h-5 mr-2" />
                      All Teachers
                    </CardTitle>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-to-r from-[#95ff00] to-[#95ff00] text-black font-semibold hover:opacity-90 transition-opacity"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add New Teacher
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead className="text-[#95ff00]">Name</TableHead>
                            <TableHead className="text-[#95ff00]">Email</TableHead>
                            <TableHead className="text-[#95ff00]">Phone</TableHead>
                            <TableHead className="text-[#95ff00]">Qualification</TableHead>
                            <TableHead className="text-[#95ff00]">Experience</TableHead>
                            <TableHead className="text-[#95ff00]">Subject Field</TableHead>
                            <TableHead className="text-[#95ff00]">Rating</TableHead>
                            <TableHead className="text-[#95ff00]">Status</TableHead>
                            <TableHead className="text-[#95ff00]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allTeachers && allTeachers.length > 0 ? (
                            allTeachers.map((teacher) => (
                              <TableRow
                                key={teacher._id}
                                className="border-white/10 hover:bg-white/5"
                              >
                                <TableCell className="text-gray-300 font-medium">
                                  {teacher.username}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {teacher.email}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {teacher.phone || "N/A"}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {teacher.highestQualification || "N/A"}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                    {teacher.experience || 0} years
                                  </span>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  <div className="flex flex-wrap gap-1">
                                    {Array.isArray(teacher.subject) &&
                                      teacher.subject.map((sub, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 text-xs bg-[#95ff00]/20 text-[#95ff00] rounded-full border border-[#95ff00]/30"
                                        >
                                          {sub.field}
                                        </span>
                                      ))}
                                    {(!teacher.subject || teacher.subject.length === 0) && (
                                      <span className="text-gray-500 text-xs">No subjects</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-400">★</span>
                                    <span>{teacher.rating || 0}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      teacher.approvalStatus === "approved"
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : teacher.approvalStatus === "pending"
                                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                                    }`}
                                  >
                                    {(teacher.approvalStatus || "unknown").toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditTeacher(teacher)}
                                    className="bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] hover:bg-[#95ff00]/20"
                                  >
                                    Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                className="text-center text-gray-400 py-8"
                              >
                                No teachers found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="orders">
              <motion.div
                key="orders-content-real"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#95ff00] flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Order Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead className="text-[#95ff00]">
                              Order ID
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              User
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Amount
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Status
                            </TableHead>
                            <TableHead className="text-[#95ff00]">
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.length > 0 ? (
                            orders.map((order) => (
                              <TableRow
                                key={order._id}
                                className="border-white/10 hover:bg-white/5"
                              >
                                <TableCell className="text-gray-300 font-mono text-xs">
                                  {order._id
                                    ? order._id.substring(0, 8) + "..."
                                    : "N/A"}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {order.user?.email || "N/A"}
                                </TableCell>
                                <TableCell className="text-gray-300 font-semibold">
                                  ₹{(order.amount || 0) / 100}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      order.status === "completed"
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : order.status === "pending"
                                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                                    }`}
                                  >
                                    {(order.status || "unknown").toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {order.createdAt
                                    ? new Date(
                                        order.createdAt,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-gray-400 py-8"
                              >
                                No orders found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="maintenance">
              <motion.div
                key="maintenance-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-md border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-[#95ff00] flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Server Maintenance Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
                        <p className="text-gray-400 text-sm">
                          {maintenanceMode 
                            ? "Server is currently in maintenance mode" 
                            : "Server is running normally"
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${maintenanceMode ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                        <Button
                          onClick={toggleMaintenanceMode}
                          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                            maintenanceMode
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-orange-600 hover:bg-orange-700 text-white'
                          }`}
                        >
                          {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Maintenance Message
                      </label>
                      <textarea
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="Enter the message to show users during maintenance..."
                        className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] resize-none"
                        rows="3"
                      />
                      <p className="text-gray-500 text-xs">
                        This message will be displayed to all users when maintenance mode is enabled.
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-black text-xs font-bold">!</span>
                        </div>
                        <div>
                          <h4 className="text-yellow-400 font-medium">Important Note</h4>
                          <p className="text-yellow-300 text-sm mt-1">
                            Enabling maintenance mode will show a popup message to all users but will not block any API routes. 
                            Users can still access the application functionality normally.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal />

      {/* Teacher Edit Modal */}
      {showEditModal && editingTeacher && (
        <TeacherEditModal
          teacher={editingTeacher}
          onClose={() => {
            setShowEditModal(false);
            setEditingTeacher(null);
          }}
          onUpdate={handleUpdateTeacher}
        />
      )}

      {/* Teacher Add Modal */}
      {showAddModal && (
        <TeacherAddModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTeacher}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
