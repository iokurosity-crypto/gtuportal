import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Label, Checkbox } from "@/components/ui";
import { Briefcase, Calendar, MapPin, Building, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/axios";

const ExperienceModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    startDate: "",
    endDate: "",
    current: false,
    description: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Fetch current profile to get existing workExperience array
      const profileRes = await api.get("/alumni/my-profile");
      const currentExperience = profileRes.data.alumni.workExperience || [];
      
      // Add new experience to the array
      const updatedExperience = [...currentExperience, formData];

      // Update profile
      const response = await api.put("/alumni/update-profile", {
        workExperience: updatedExperience
      });

      if (response.data.success) {
        toast.success("Experience added successfully!");
        onOpenChange(false);
        if (onSuccess) onSuccess();
        // Reset form
        setFormData({
          title: "",
          company: "",
          location: "",
          type: "Full-time",
          startDate: "",
          endDate: "",
          current: false,
          description: ""
        });
      } else {
        toast.error(response.data.message || "Failed to add experience");
      }
    } catch (error) {
      console.error("Error adding experience:", error);
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
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Add Experience</DialogTitle>
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
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Job Title *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="title"
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="pl-10 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-semibold text-slate-700">Company *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="company"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="pl-10 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-slate-700">Employment Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md focus:ring-blue-500 text-sm"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-slate-700">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="location"
                  placeholder="e.g. Mountain View, CA"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
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
            <Label htmlFor="current" className="text-sm text-slate-600 font-medium">I am currently working in this role</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
            <Textarea
              id="description"
              placeholder="What did you do at this position?"
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
              {loading ? "Adding..." : "Save Experience"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceModal;
