import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Label, Checkbox } from "@/components/ui";
import { GraduationCap, Calendar, BookOpen, School, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/axios";

const EducationModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    gpa: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.institution || !formData.degree || !formData.field || !formData.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Fetch current profile to get existing education array
      const profileRes = await api.get("/alumni/my-profile");
      const currentEducation = profileRes.data.alumni.education || [];
      
      // Add new education to the array
      const updatedEducation = [...currentEducation, formData];

      // Update profile
      const response = await api.put("/alumni/update-profile", {
        education: updatedEducation
      });

      if (response.data.success) {
        toast.success("Education added successfully!");
        onOpenChange(false);
        if (onSuccess) onSuccess();
        // Reset form
        setFormData({
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
          gpa: ""
        });
      } else {
        toast.error(response.data.message || "Failed to add education");
      }
    } catch (error) {
      console.error("Error adding education:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Add Education</DialogTitle>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          <div className="space-y-2">
            <Label htmlFor="institution" className="text-sm font-semibold text-slate-700">School/University *</Label>
            <div className="relative">
              <School className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="institution"
                placeholder="e.g. L.D. College of Engineering"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="pl-10 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-sm font-semibold text-slate-700">Degree *</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="degree"
                  placeholder="e.g. B.E."
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field" className="text-sm font-semibold text-slate-700">Field of Study *</Label>
              <Input
                id="field"
                placeholder="e.g. Information Technology"
                value={formData.field}
                onChange={(e) => handleInputChange('field', e.target.value)}
                className="border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="endDate"
                  type="month"
                  disabled={formData.current}
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 py-1">
            <Checkbox 
              id="current" 
              checked={formData.current}
              onCheckedChange={(checked) => handleInputChange('current', checked)}
              className="border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="current" className="text-sm text-slate-600 font-medium">I am currently studying here</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpa" className="text-sm font-semibold text-slate-700">GPA (Optional)</Label>
            <Input
              id="gpa"
              placeholder="e.g. 8.5/10.0"
              value={formData.gpa}
              onChange={(e) => handleInputChange('gpa', e.target.value)}
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
            <Textarea
              id="description"
              placeholder="Talk about your achievements, courses, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="border-slate-200 min-h-[100px] resize-none"
            />
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 font-semibold shadow-md shadow-blue-200 transition-all"
            >
              {loading ? "Adding..." : "Save Education"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EducationModal;
