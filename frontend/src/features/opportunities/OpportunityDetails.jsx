import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Building2, 
  ExternalLink,
  ArrowLeft,
  Share2,
  Bookmark,
  ShieldCheck,
  Users,
  Clock
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { opportunitiesData } from '@/data/opportunitiesData';
import { toast } from 'sonner';

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    // Simulating API fetch - in real scenario, you'd fetch from backend
    const findOpportunity = () => {
      // Search in opportunitiesData by id (convert string to number for comparison)
      const found = opportunitiesData.find(opp => opp.id === parseInt(id) || opp.id === id);
      if (found) {
        setOpportunity(found);
        setIsSaved(found.saved || false);
      } else {
        // In real app, fetch from API
        setOpportunity(null);
      }
      setLoading(false);
    };

    findOpportunity();
  }, [id]);

  const handleApplyNow = () => {
    if (!opportunity?.applicationLink) {
      toast.error('No application link available');
      return;
    }

    setIsApplying(true);
    
    // Open application link in new tab
    if (opportunity.applicationLink.startsWith('http')) {
      window.open(opportunity.applicationLink, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = `mailto:${opportunity.applicationLink}`;
    }

    // Mark as applied locally
    setTimeout(() => {
      setIsApplying(false);
      toast.success('Redirecting to application page...');
    }, 500);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Added to saved opportunities');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opportunity?.title,
        text: `Check out this opportunity: ${opportunity?.title} at ${opportunity?.company}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading opportunity details...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-red-200 bg-red-50">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Opportunity Not Found</h3>
              <p className="text-red-700 mb-6 text-sm">The opportunity you're looking for doesn't exist or has been removed.</p>
              <Button 
                onClick={() => navigate('/opportunities')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Back to Opportunities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/opportunities')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Opportunities
        </button>

        {/* Main Card */}
        <Card className="overflow-hidden shadow-lg border-gray-200 mb-8">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg overflow-hidden">
                    <img
                      src={opportunity.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(opportunity.company)}&background=f0f7ff&color=005eb8&bold=true`}
                      alt={opportunity.company}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black mb-2 leading-tight">{opportunity.title}</h1>
                    <div className="flex items-center gap-2 text-blue-100 mb-3">
                      <Building2 className="h-4 w-4" />
                      <span className="text-lg font-semibold">{opportunity.company}</span>
                      {opportunity.verified && (
                        <ShieldCheck className="h-5 w-5 text-yellow-300" />
                      )}
                    </div>
                    <p className="text-blue-100">{opportunity.postedDate || 'Posted recently'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSave}
                    variant="ghost"
                    className={`rounded-full transition-all ${
                      isSaved 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Bookmark className={`h-5 w-5 ${isSaved && 'fill-current'}`} />
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="ghost"
                    className="bg-white/10 text-white hover:bg-white/20 rounded-full transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8">
              {/* Key Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Employment Type</p>
                    <p className="font-bold text-slate-900">{opportunity.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Salary</p>
                    <p className="font-bold text-slate-900">{opportunity.salary || opportunity.stipend || 'Not disclosed'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Location</p>
                    <p className="font-bold text-slate-900">{opportunity.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Work Mode</p>
                    <p className="font-bold text-slate-900">{opportunity.workMode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Deadline</p>
                    <p className="font-bold text-slate-900">{opportunity.deadline}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Experience Level</p>
                    <p className="font-bold text-slate-900">{opportunity.experienceLevel || 'Entry Level'}</p>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {opportunity.description && (
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              )}

              {/* Skills Section */}
              {opportunity.skills && opportunity.skills.length > 0 && (
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-3">
                    {opportunity.skills.map((skill, idx) => (
                      <Badge 
                        key={idx}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors px-4 py-2"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="mb-8 pb-8 border-b border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Department</p>
                  <p className="font-semibold text-slate-900">{opportunity.department}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Industry</p>
                  <p className="font-semibold text-slate-900">{opportunity.industry}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Company Type</p>
                  <p className="font-semibold text-slate-900">{opportunity.companyType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Education</p>
                  <p className="font-semibold text-slate-900">{opportunity.education || 'B.E. / B.Tech'}</p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
                <p className="text-slate-700 mb-6 font-medium">
                  Ready to apply? Click the button below to visit the opportunity website and submit your application.
                </p>
                <Button
                  onClick={handleApplyNow}
                  disabled={isApplying}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <span>Apply Now on Company Website</span>
                      <ExternalLink className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-sm text-slate-500 mb-8">
          <p>
            Clicking "Apply Now" will redirect you to the company's official application page. 
            Make sure your resume and profile are up to date before applying.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;
