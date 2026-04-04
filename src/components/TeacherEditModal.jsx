import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import PropTypes from "prop-types";

const TeacherEditModal = ({ teacher, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    highestQualification: "",
    experience: "",
    specialization: "",
    bio: "",
    subjectField: "",
    subjectSubcategories: [],
    certifications: [],
    approvalStatus: "pending",
    rating: 0,
    doubtsSolved: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        username: teacher.username || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        highestQualification: teacher.highestQualification || "",
        experience: teacher.experience || "",
        specialization: teacher.specialization || "",
        bio: teacher.bio || "",
        subjectField: teacher.subject?.[0]?.field || "",
        subjectSubcategories: teacher.subject?.[0]?.subcategory || [],
        certifications: teacher.certification || [],
        approvalStatus: teacher.approvalStatus || "pending",
        rating: teacher.rating || 0,
        doubtsSolved: teacher.doubtsSolved || 0,
      });
    }
  }, [teacher]);

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

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Phone must be at least 10 characters";
    }

    if (!formData.highestQualification.trim()) {
      newErrors.highestQualification = "Qualification is required";
    }

    if (!formData.experience) {
      newErrors.experience = "Experience is required";
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
      const updates = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        highestQualification: formData.highestQualification,
        experience: parseInt(formData.experience),
        specialization: formData.specialization,
        bio: formData.bio,
        subject: formData.subjectField
          ? [
              {
                field: formData.subjectField,
                subcategory: formData.subjectSubcategories.filter((s) => s.trim()),
              },
            ]
          : [],
        certification: formData.certifications.filter((c) => c.trim()),
        approvalStatus: formData.approvalStatus,
        rating: parseFloat(formData.rating) || 0,
        doubtsSolved: parseInt(formData.doubtsSolved) || 0,
      };

      await onUpdate(teacher._id, updates);
      onClose();
    } catch (error) {
      console.error("Error updating teacher:", error);
      setErrors({ submit: error.message || "Failed to update teacher" });
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00FF9D] to-cyan-400 bg-clip-text text-transparent">
              Edit Teacher Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
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
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
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
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
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
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
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
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
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
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                  placeholder="e.g., Advanced Mathematics, Physics"
                />
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
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors resize-none"
                placeholder="Brief description about the teacher..."
              />
            </div>

            {/* Subject Field - For Doubt Matching */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject Field <span className="text-yellow-400 text-xs">(For Doubt Matching)</span>
              </label>
              <input
                type="text"
                name="subjectField"
                value={formData.subjectField}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                placeholder="e.g., Mathematics, Science, English"
              />
              {errors.subjectField && (
                <p className="text-red-400 text-sm mt-1">{errors.subjectField}</p>
              )}
            </div>

            {/* Subject Subcategories - For Doubt Matching */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject Subcategories <span className="text-yellow-400 text-xs">(For Doubt Matching)</span>
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
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                      placeholder="e.g., Algebra, Calculus"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, "subjectSubcategories")}
                      className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("subjectSubcategories")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] rounded-lg hover:bg-[#00FF9D]/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Subcategory
                </button>
              </div>
              {errors.subjectSubcategories && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.subjectSubcategories}
                </p>
              )}
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Certifications
              </label>
              <div className="space-y-2">
                {formData.certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) =>
                        handleArrayChange(index, e.target.value, "certifications")
                      }
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                      placeholder="e.g., Certified Mathematics Teacher"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, "certifications")}
                      className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("certifications")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] rounded-lg hover:bg-[#00FF9D]/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Approval Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Approval Status
                </label>
                <select
                  name="approvalStatus"
                  value={formData.approvalStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                />
              </div>

              {/* Doubts Solved */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Doubts Solved
                </label>
                <input
                  type="number"
                  name="doubtsSolved"
                  value={formData.doubtsSolved}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF9D] transition-colors"
                />
              </div>
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
                className="flex-1 bg-gradient-to-r from-[#00FF9D] to-cyan-400 text-black font-semibold hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Teacher"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

TeacherEditModal.propTypes = {
  teacher: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default TeacherEditModal;
