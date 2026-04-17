import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import {
  DollarSign,
  Briefcase,
  Award,
  Users,
  Calendar,
  Building,
  GraduationCap,
  AlertCircle,
  Send,
  Star,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/axios';
import { uploadImage } from '@/utils/cloudinary';
import { toast } from 'sonner';

const PostChallenge = ({ onClose, onSuccess }) => {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    batchYear: '',
    domain: '',
    description: '',
    problemStatement: '',
    skillsRequired: '',
    expectedDeliverables: '',
    cashReward: '',
    internshipReward: false,
    certificateReward: false,
    mentorshipReward: false,
    otherRewards: '',
    deadline: '',
    registrationLink: '',
    contactEmail: '',
    difficulty: 'beginner',
    duration: '1week',
    disclaimerAccepted: false
  });

  useEffect(() => {
    if (!auth.isLoggedIn) {
      toast.error('Please login to post a challenge');
      if (onClose) onClose();
    }
  }, [auth.isLoggedIn, onClose]);

  const domains = [
    'Technology', 'Business', 'Design', 'Marketing', 'Data Science', 'AI/ML',
    'Engineering', 'Finance', 'Healthcare', 'Education', 'Other'
  ];

  const batchYears = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i - 1);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setImagePreview(URL.createObjectURL(file));
    try {
      console.log('📸 [PostChallenge] Uploading image:', file.name, 'Size:', file.size);
      const result = await uploadImage(file);
      console.log('✅ [PostChallenge] Image uploaded successfully:', result);
      setCoverImageUrl(result.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('❌ [PostChallenge] Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.isLoggedIn) {
      toast.error('Please login to post a challenge');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a challenge title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a short description');
      return;
    }

    if (!formData.problemStatement.trim()) {
      toast.error('Please enter a problem statement');
      return;
    }

    if (!formData.deadline) {
      toast.error('Please select a deadline');
      return;
    }

    if (!formData.companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    if (!formData.batchYear) {
      toast.error('Please select your batch year');
      return;
    }

    if (!formData.domain) {
      toast.error('Please select a domain category');
      return;
    }

    if (!formData.registrationLink && !formData.contactEmail) {
      toast.error('Please provide either a registration link or contact email');
      return;
    }

    if (!formData.disclaimerAccepted) {
      toast.error('Please accept the disclaimer to continue');
      return;
    }

    setLoading(true);

    try {
      const challengeData = {
        title: formData.title,
        description: formData.description,
        companyName: formData.companyName,
        batchYear: formData.batchYear,
        domain: formData.domain,
        problemStatement: formData.problemStatement,
        skillsRequired: formData.skillsRequired,
        expectedDeliverables: formData.expectedDeliverables,
        cashReward: formData.cashReward,
        internshipReward: formData.internshipReward,
        certificateReward: formData.certificateReward,
        mentorshipReward: formData.mentorshipReward,
        otherRewards: formData.otherRewards,
        deadline: formData.deadline,
        registrationLink: formData.registrationLink || formData.contactEmail,
        applyLink: formData.registrationLink,
        applyEmail: formData.contactEmail,
        contactEmail: formData.contactEmail,
        difficulty: formData.difficulty,
        duration: formData.duration,
        ...(coverImageUrl && { coverImage: coverImageUrl })
      };

      const response = await api.post('/challenges', challengeData);

      if (response.data) {
        toast.success('Challenge posted successfully! 🎉');
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error posting challenge:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to post challenge. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl">
      {/* Header with Close Button */}
      <div className="sticky top-0 bg-white border-b border-slate-100 flex items-center justify-between p-6 z-10 rounded-t-2xl">
        <div>
          <h1 className="text-lg font-black text-slate-900">Post a Challenge</h1>
          <p className="text-xs text-slate-500 font-medium">Share an opportunity with alumni</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="max-h-[calc(90vh-200px)] overflow-y-auto space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-full p-1.5">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-900">500+</div>
                <div className="text-xs text-blue-700">Active Alumni</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 rounded-full p-1.5">
                <Award className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-green-900">50+</div>
                <div className="text-xs text-green-700">Challenges Posted</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 rounded-full p-1.5">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-purple-900">200+</div>
                <div className="text-xs text-purple-700">Applications</div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200/80 shadow-lg rounded-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">Challenge Details</CardTitle>
              <p className="text-slate-600 text-sm">Fill in the information below to post your challenge</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      </div>
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                          Challenge Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="e.g. AI-Powered Healthcare Solution Challenge"
                          required
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                          Company Name *
                        </Label>
                        <Input
                          id="company"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="e.g. Google, Microsoft, Startup Name"
                          required
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="batch" className="block text-sm font-medium text-slate-700 mb-1">
                          Batch Year *
                        </Label>
                        <select
                          value={formData.batchYear}
                          onChange={(e) => handleInputChange('batchYear', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        >
                          <option value="">Select your batch year</option>
                          {batchYears.map(year => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="domain" className="block text-sm font-medium text-slate-700 mb-1">
                          Domain Category *
                        </Label>
                        <select
                          value={formData.domain}
                          onChange={(e) => handleInputChange('domain', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        >
                          <option value="">Select domain</option>
                          {domains.map(domain => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-1">
                              Difficulty Level *
                            </Label>
                            <select
                              value={formData.difficulty}
                              onChange={(e) => handleInputChange('difficulty', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              required
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">
                              Estimated Duration *
                            </Label>
                            <select
                              value={formData.duration}
                              onChange={(e) => handleInputChange('duration', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              required
                            >
                              <option value="24h">24h Hackathon</option>
                              <option value="1week">1 Week</option>
                              <option value="1month">1 Month</option>
                              <option value="flexible">Flexible</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      </div>
                      Challenge Details
                    </h3>

                    <div>
                      <Label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                        Short Description *
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="A brief overview of the challenge..."
                        required
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="problemStatement" className="block text-sm font-medium text-slate-700 mb-1">
                        Problem Statement *
                      </Label>
                      <Textarea
                        id="problemStatement"
                        value={formData.problemStatement}
                        onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                        placeholder="Describe the problem in detail, the context, and what you're looking for..."
                        rows={5}
                        required
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="skillsRequired" className="block text-sm font-medium text-slate-700 mb-1">
                        Skills Required
                      </Label>
                      <Textarea
                        id="skillsRequired"
                        value={formData.skillsRequired}
                        onChange={(e) => handleInputChange('skillsRequired', e.target.value)}
                        placeholder="List the technical and soft skills participants should have..."
                        rows={2}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="expectedDeliverables" className="block text-sm font-medium text-slate-700 mb-1">
                        Expected Deliverables
                      </Label>
                      <Textarea
                        id="expectedDeliverables"
                        value={formData.expectedDeliverables}
                        onChange={(e) => handleInputChange('expectedDeliverables', e.target.value)}
                        placeholder="What should participants submit? (e.g., code repository, presentation, report, demo video...)"
                        rows={2}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      </div>
                      Challenge Rewards
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cashReward" className="block text-sm font-medium text-slate-700 mb-1">
                          Cash Amount (Optional)
                        </Label>
                        <Input
                          id="cashReward"
                          value={formData.cashReward}
                          onChange={(e) => handleInputChange('cashReward', e.target.value)}
                          placeholder="e.g. $1000, ₹50000"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="otherRewards" className="block text-sm font-medium text-slate-700 mb-1">
                          Other Benefits
                        </Label>
                        <Input
                          id="otherRewards"
                          value={formData.otherRewards}
                          onChange={(e) => handleInputChange('otherRewards', e.target.value)}
                          placeholder="e.g. Job opportunity, mentorship, swag"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="internship"
                          checked={formData.internshipReward}
                          onChange={(e) => handleInputChange('internshipReward', e.target.checked)}
                        />
                        <Label htmlFor="internship" className="text-sm font-medium text-slate-700">
                          <Briefcase className="inline h-4 w-4 mr-2" />
                          Internship Opportunity
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="certificate"
                          checked={formData.certificateReward}
                          onChange={(e) => handleInputChange('certificateReward', e.target.checked)}
                        />
                        <Label htmlFor="certificate" className="text-sm font-medium text-slate-700">
                          <Award className="inline h-4 w-4 mr-2" />
                          Certificate of Completion
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mentorship"
                          checked={formData.mentorshipReward}
                          onChange={(e) => handleInputChange('mentorshipReward', e.target.checked)}
                        />
                        <Label htmlFor="mentorship" className="text-sm font-medium text-slate-700">
                          <Users className="inline h-4 w-4 mr-2" />
                          1-on-1 Mentorship
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      </div>
                      Timeline
                    </h3>

                    <div>
                      <Label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1">
                        Application Deadline *
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                      </div>
                      Cover Image (Optional)
                    </h3>

                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-slate-400 transition-colors cursor-pointer bg-slate-50"
                        onClick={() => document.getElementById('imageInput')?.click()}>
                        <input
                          id="imageInput"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files?.[0])}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                        {imagePreview ? (
                          <div className="space-y-3">
                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            {uploadingImage && <p className="text-xs text-slate-600 text-center">Uploading...</p>}
                            {coverImageUrl && <p className="text-xs text-green-600 text-center font-medium">✓ Image uploaded successfully</p>}
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-700">Upload a cover image for your challenge</p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</div>
                      </div>
                      Application Method
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="registrationLink" className="block text-sm font-medium text-slate-700 mb-1">
                          External Registration Link
                        </Label>
                        <Input
                          id="registrationLink"
                          type="url"
                          value={formData.registrationLink}
                          onChange={(e) => handleInputChange('registrationLink', e.target.value)}
                          placeholder="https://forms.google.com/..."
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Students will apply directly through this link
                        </p>
                      </div>

                      <div className="text-center text-slate-500 text-sm">OR</div>

                      <div>
                        <Label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 mb-1">
                          Contact Email Address
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          placeholder="email@example.com"
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Students will contact you directly via email
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-1 text-sm">Important Disclaimer</h4>
                          <p className="text-amber-800 text-xs mb-3">
                            AluVerse only provides the platform for listing challenges. We do not manage applications, verify submissions, or handle rewards. All communication and rewards are handled directly by you.
                          </p>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="disclaimer"
                              checked={formData.disclaimerAccepted}
                              onChange={(e) => handleInputChange('disclaimerAccepted', e.target.checked)}
                            />
                            <Label htmlFor="disclaimer" className="text-sm font-medium text-amber-900">
                              I understand that AluVerse only provides listing and does not manage this challenge.
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 border-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || uploadingImage}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                    >
                      {loading ? (
                        'Posting...'
                      ) : uploadingImage ? (
                        'Uploading Image...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post Challenge
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PostChallenge;
