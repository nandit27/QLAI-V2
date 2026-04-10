import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import PropTypes from "prop-types";

import { Button } from "../components/ui/Button";

const TeacherAddModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    highestQualification: "",
    experience: "",
    specialization: "",
    bio: "",
    subjectField: "",
    subjectSubcategories: [""],
    approvalStatus: "approved",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleArrayChange = (index, value, arrayName) => {
    setFormData((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ""],
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Phone must be at least 10 characters";
    }

    if (!formData.highestQualification.trim()) {
      newErrors.highestQualification = "Qualification is required";
    }

    if (!formData.experience) {
      newErrors.experience = "Experience is required";
    }

    if (!formData.subjectField.trim()) {
      newErrors.subjectField = "Subject field is required for doubt matching";
    }

    const validSubcategories = formData.subjectSubcategories.filter((s) => s.trim());
    if (validSubcategories.length === 0) {
      newErrors.subjectSubcategories = "At least one subcategory is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data to match API expectations
      const teacherData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        highestQualification: formData.highestQualification,
        experience: parseInt(formData.experience),
        specialization: formData.specialization,
        bio: formData.bio,
        subject: [
          {
            field: formData.subjectField,
            subcategory: formData.subjectSubcategories.filter((s) => s.trim()),
          },
        ],
        approvalStatus: formData.approvalStatus,
      };

      await onAdd(teacherData);
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        phone: "",
        highestQualification: "",
        experience: "",
        specialization: "",
        bio: "",
        subjectField: "",
        subjectSubcategories: [""],
        approvalStatus: "approved",
      });
    } catch (error) {
      console.error("Error adding teacher:", error);
      setErrors({ submit: error.message || "Failed to add teacher" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#95ff00] to-[#95ff00] bg-clip-text text-transparent">
              Add New Teacher
            </h2>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              variant="ghost"
              size="icon">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Highest Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Highest Qualification *
                </label>
                <input
                  type="text"
                  name="highestQualification"
                  value={formData.highestQualification}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                  placeholder="e.g., PhD, Masters, Bachelor's"
                />
                {errors.highestQualification && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.highestQualification}
                  </p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                  placeholder="Enter years"
                />
                {errors.experience && (
                  <p className="text-red-400 text-sm mt-1">{errors.experience}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                  placeholder="e.g., Advanced Mathematics, Physics"
                />
              </div>

              {/* Approval Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Approval Status
                </label>
                <select
                  name="approvalStatus"
                  value={formData.approvalStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio / Description
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors resize-none"
                placeholder="Brief description about the teacher..."
              />
            </div>

            {/* Subject Field - For Doubt Matching */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject Field * <span className="text-yellow-400 text-xs">(For Doubt Matching)</span>
              </label>
              <input
                type="text"
                name="subjectField"
                value={formData.subjectField}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                placeholder="e.g., Mathematics, Science, English"
              />
              {errors.subjectField && (
                <p className="text-red-400 text-sm mt-1">{errors.subjectField}</p>
              )}
            </div>

            {/* Subject Subcategories - For Doubt Matching */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject Subcategories * <span className="text-yellow-400 text-xs">(For Doubt Matching)</span>
              </label>
              <div className="space-y-2">
                {formData.subjectSubcategories.map((subcategory, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) =>
                        handleArrayChange(index, e.target.value, "subjectSubcategories")
                      }
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#95ff00] transition-colors"
                      placeholder="e.g., Algebra, Calculus"
                    />
                    {formData.subjectSubcategories.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeArrayItem(index, "subjectSubcategories")}
                        className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                        variant="ghost"
                        size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
                <Button
                  type="button"
                  onClick={() => addArrayItem("subjectSubcategories")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#95ff00]/10 border border-[#95ff00]/30 text-[#95ff00] rounded-lg hover:bg-[#95ff00]/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Subcategory
                </Button>
              </div>
              {errors.subjectSubcategories && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.subjectSubcategories}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#95ff00] to-[#95ff00] text-black font-semibold hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Teacher"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

TeacherAddModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default TeacherAddModal;
