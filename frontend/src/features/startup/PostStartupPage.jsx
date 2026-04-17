import { useState } from "react";
import { Rocket, Target, Lightbulb, Zap, Users, Eye, Image as ImageIcon, Send, X, Plus } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";
import { toast } from "sonner";
import api from "../../services/axios";
import { uploadImage } from "@/utils/cloudinary";

const stages = ["Idea", "Prototype", "MVP", "Early Users", "Revenue"];
const needsList = ["Team", "Funding", "Mentorship", "Beta Testers", "Legal Advice"];

const PostStartupPage = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    startupName: "", tagline: "", stage: "Idea", coverImage: null,
    problem: "", solution: "", keyFeatures: "", targetUsers: "", impact: "", vision: "", supportNeeded: [],
  });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleNeed = (item) => {
    setFormData(prev => ({
      ...prev,
      supportNeeded: prev.supportNeeded.includes(item)
        ? prev.supportNeeded.filter(n => n !== item)
        : [...prev.supportNeeded, item],
    }));
  };

  const handlePoster = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      console.log('📸 [PostStartup] Uploading image:', file.name, 'Size:', file.size);
      const result = await uploadImage(file);
      console.log('✅ [PostStartup] Image uploaded successfully:', result);
      setFormData(prev => ({ ...prev, coverImage: result.url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("❌ [PostStartup] Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 [PostStartup] Form submission started');
    console.log('📋 [PostStartup] Form data:', formData);
    
    // Validate required fields
    if (!formData.startupName?.trim()) {
      toast.error("Startup Name is required");
      return;
    }
    
    if (!formData.problem?.trim()) {
      toast.error("Problem statement is required");
      return;
    }
    
    if (!formData.solution?.trim()) {
      toast.error("Solution description is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.startupName,
        tagline: formData.tagline,
        stage:
          formData.stage === "Idea" ? "concept" :
          formData.stage === "Prototype" ? "prototype" :
          formData.stage === "MVP" ? "mvp" :
          formData.stage === "Early Users" ? "early-users" :
          formData.stage === "Revenue" ? "revenue" :
          "concept",
        problem: formData.problem,
        solution: formData.solution,
        // Store cover image as attachment if provided
        ...(formData.coverImage ? { attachments: [formData.coverImage] } : {}),
        // Keep extra fields if backend supports them later
        keyFeatures: formData.keyFeatures,
        targetUsers: formData.targetUsers,
        impact: formData.impact,
        vision: formData.vision,
        supportNeeded: formData.supportNeeded,
      };

      console.log('🚀 [PostStartup] Sending payload to API:', payload);
      const response = await api.post("/startups", payload);
      console.log('✅ [PostStartup] Server response:', response.data);
      
      if (response.data) {
        toast.success("Startup launched successfully! 🚀");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("❌ [PostStartup] Submission error:", error);
      console.error("❌ [PostStartup] Error response:", error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to launch startup";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-100 flex items-center justify-between p-6 z-10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Launchpad</h1>
            <p className="text-xs text-slate-500 font-medium">Share your vision</p>
          </div>
        </div>
        <button onClick={onClose} className="h-10 w-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-900">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-6">
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-black text-slate-900">The Core Idea</h2>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Startup Name *</label>
                  <Input name="startupName" value={formData.startupName} onChange={handleInputChange} placeholder="e.g. EcoTrack, SkillSwap, etc." className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tagline</label>
                  <Input name="tagline" value={formData.tagline} onChange={handleInputChange} placeholder="A one-sentence summary" className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Current Stage</label>
                  <div className="flex flex-wrap gap-2">
                    {stages.map(s => (
                      <button key={s} type="button" onClick={() => setFormData(prev => ({ ...prev, stage: s }))} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.stage === s ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Target className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-black text-slate-900">Problem & Solution</h2>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">The Problem *</label>
                  <Textarea name="problem" value={formData.problem} onChange={handleInputChange} placeholder="What pain point are you solving?" className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium p-4" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Your Solution *</label>
                  <Textarea name="solution" value={formData.solution} onChange={handleInputChange} placeholder="How does your startup solve this?" className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium p-4" />
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Zap className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-black text-slate-900">Details</h2>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Key Features</label>
                  <Textarea name="keyFeatures" value={formData.keyFeatures} onChange={handleInputChange} placeholder="List key features" className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium p-4" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Target Users</label>
                    <Input name="targetUsers" value={formData.targetUsers} onChange={handleInputChange} placeholder="Who is this for?" className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Impact</label>
                    <Input name="impact" value={formData.impact} onChange={handleInputChange} placeholder="Social or economic impact" className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Eye className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-black text-slate-900">Vision</h2>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Our Vision</label>
                <Textarea name="vision" value={formData.vision} onChange={handleInputChange} placeholder="Where do you see this in 5 years?" className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:ring-blue-500/20 font-medium p-4" />
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <ImageIcon className="h-4 w-4 text-purple-500" />
              <h2 className="text-sm font-black text-slate-900">Cover Image</h2>
            </div>
            <div className="space-y-3">
              {preview ? (
                <div className="relative rounded-xl overflow-hidden h-24 border-2 border-blue-500/20">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setPreview(null); setFormData(prev => ({ ...prev, coverImage: null })); }} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                    <X className="h-3 w-3" />
                  </button>
                  {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer">
                  <Plus className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-500">Add Cover</span>
                  <input type="file" className="hidden" onChange={handlePoster} accept="image/*" disabled={isUploading} />
                </label>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Users className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-black text-slate-900">Support Needed</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {needsList.map(item => (
                <button key={item} type="button" onClick={() => toggleNeed(item)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.supportNeeded.includes(item) ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200"}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-slate-300 hover:bg-slate-50">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-xl shadow-blue-600/30 gap-2 group disabled:opacity-50">
              {isSubmitting || isUploading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="h-4 w-4" />Launch</>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostStartupPage;
