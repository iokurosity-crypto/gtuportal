import { ArrowLeft, Rocket, Target, Zap, Users, Share2, CheckCircle2, Globe, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Badge, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { toast } from 'sonner';
import api from '@/services/axios';

const StartupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStartupDetails();
  }, [id]);

  const fetchStartupDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/startups/${id}`);
      setStartup(response.data);
    } catch (error) {
      console.error('Error fetching startup details:', error);
      toast.error('Failed to load startup details');
      setTimeout(() => navigate('/innovation'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Startup not found</h2>
          <Button onClick={() => navigate('/innovation')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startups
          </Button>
        </div>
      </div>
    );
  }

  const goBack = () => navigate('/innovation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-12">
      {/* Hero Banner */}
      <div className="relative h-80 w-full overflow-hidden">
        <img 
          src={startup.poster || startup.coverImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"} 
          alt={startup.startupName || startup.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-transparent" />
        
        <button 
          onClick={() => navigate('/innovation')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all font-bold border border-white/20 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="absolute bottom-8 left-0 right-0 px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/95 text-slate-900 border-none font-bold text-xs px-2.5 py-1">
                  {startup.stage || "Idea"}
                </Badge>
                {(startup.supportNeeded || startup.needs || []).slice(0, 2).map(need => (
                  <Badge key={need} className="bg-white/20 text-white border border-white/30 backdrop-blur-sm px-2.5 py-1 font-bold text-xs">
                    {need}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {startup.startupName || startup.title}
              </h1>
              <p className="text-base text-slate-200 font-semibold leading-relaxed max-w-2xl">
                {startup.tagline || "Innovative startup from LDCE"}
              </p>
            </div>
            
            
            <div className="flex items-center">
              <Button size="icon" className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Founder Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-blue-100 bg-blue-50">
                  <AvatarImage src={startup.ownerId?.profilePhoto || startup.ownerId?.profilePicture || startup.ownerId?.photoURL || `https://ui-avatars.com/api/?name=${startup.ownerId?.name || startup.founder || 'Alumni'}&background=random`} />
                  <AvatarFallback className="text-sm font-bold">{(startup.ownerId?.name || startup.founder || 'A')[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Founded by</p>
                  <h3 className="text-lg font-bold text-slate-900">{startup.ownerId?.name || startup.founder || "LDCEite"}</h3>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="rounded-lg font-bold border-slate-200 hover:bg-slate-50 text-sm h-10"
                onClick={() => {
                  const ownerId = startup.ownerId?._id || startup.ownerId;
                  if (ownerId) navigate(`/profile/${ownerId}`);
                }}
              >
                View Profile
              </Button>
            </div>

            {/* Problem Section */}
            {startup.problem && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                    <Target className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 text-slate-600 leading-relaxed font-medium">
                  {startup.problem}
                </div>
              </section>
            )}

            {/* Solution Section */}
            {startup.solution && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">The Solution</h2>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 text-slate-600 leading-relaxed font-medium">
                  {startup.solution}
                </div>
              </section>
            )}

            {/* Key Features */}
            {(startup.features || startup.keyFeatures) && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Key Features</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {((startup.features || startup.keyFeatures)?.split('\n').filter(f => f.trim()) || []).map((feature, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="font-medium text-slate-700 text-sm">{feature.replace('•', '').trim()}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Target Users */}
            {startup.targetUsers && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Target Users</h2>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 text-slate-600 leading-relaxed font-medium">
                  {startup.targetUsers}
                </div>
              </section>
            )}

            {/* Impact */}
            {startup.impact && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Expected Impact</h2>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 text-slate-600 leading-relaxed font-medium">
                  {startup.impact}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vision Card */}
            {startup.vision && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white space-y-4 shadow-lg shadow-blue-600/20">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">Our Vision</h3>
                </div>
                <p className="font-medium leading-relaxed text-blue-50 text-sm">
                  "{startup.vision}"
                </p>
              </div>
            )}

            {/* CTA Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4 text-center">
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mx-auto">
                <Rocket className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Join the Team</h4>
                <p className="text-xs text-slate-500 font-medium">Help build this vision</p>
              </div>
              <Button variant="outline" className="w-full h-10 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-sm">
                Get Involved
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDetails;