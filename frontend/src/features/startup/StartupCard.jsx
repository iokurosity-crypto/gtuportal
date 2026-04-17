import React from 'react';
import { Rocket, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { motion } from 'framer-motion';

const StartupCard = ({ startup, onClick }) => {
  if (!startup) return null;

  // Get stage color coding
  const getStageColor = (stage) => {
    const stageMap = {
      'Idea': 'bg-slate-100 text-slate-700',
      'Prototype': 'bg-blue-100 text-blue-700',
      'MVP': 'bg-amber-100 text-amber-700',
      'Early Users': 'bg-teal-100 text-teal-700',
      'Revenue': 'bg-green-100 text-green-700',
    };
    return stageMap[stage] || 'bg-slate-100 text-slate-700';
  };

  // Professional image mapping based on keywords
  const getProfessionalImage = (startup) => {
    const title = (startup.startupName || startup.title || '').toLowerCase();
    const currentImage = startup.poster || startup.coverImage;

    // If it's a valid external high-quality image, use it
    if (currentImage && currentImage.startsWith('http') && !currentImage.includes('picsum.photos') && !currentImage.includes('dog')) {
      return currentImage;
    }

    // Category based professional images from Unsplash
    if (title.includes('tech') || title.includes('software') || title.includes('app')) 
      return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800';
    if (title.includes('health') || title.includes('med') || title.includes('bio')) 
      return 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800';
    if (title.includes('finance') || title.includes('money') || title.includes('fin')) 
      return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800';
    if (title.includes('edu') || title.includes('learn') || title.includes('school')) 
      return 'https://images.unsplash.com/photo-1523240715639-963c6a06667d?auto=format&fit=crop&q=80&w=800';
    
    // Default professional startup visual
    const seeds = ['startup', 'business', 'office', 'team', 'idea', 'vision'];
    const seed = seeds[Math.abs((startup._id || startup.id || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % seeds.length];
    return `https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800&sig=${seed}`;
  };

  const coverImage = getProfessionalImage(startup);
  const founderName = startup.ownerId?.name || 'Alumni';
  const founderPhoto = startup.ownerId?.profilePhoto || startup.ownerId?.profilePicture || startup.ownerId?.photoURL;
  const problemPreview = startup.problem || '';
  const supportChips = startup.supportNeeded || startup.needs || [];

  // Handle image error by falling back to a safe placeholder
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-500 bg-white overflow-hidden group rounded-2xl flex flex-col">
        {/* Header/Cover Section */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
          <img 
            src={coverImage} 
            alt={startup.startupName || startup.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          
          <Badge className={`absolute top-3 right-3 border-none font-bold text-xs px-2 py-1 shadow-md ${getStageColor(startup.stage)}`}>
            {startup.stage || 'Idea'}
          </Badge>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="h-8 w-8 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
              {founderPhoto ? (
                <img 
                  src={founderPhoto} 
                  alt={founderName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${founderName}&background=random`; }}
                />
              ) : (
                <Rocket className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <p className="text-white font-bold text-xs line-clamp-1">
              {founderName}
            </p>
          </div>
        </div>

        <CardHeader className="pt-4 pb-2 px-5">
          <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {startup.startupName || startup.title}
            </CardTitle>
            <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          {startup.tagline && (
            <p className="text-blue-600 font-semibold text-xs leading-snug italic line-clamp-1">
              "{startup.tagline}"
            </p>
          )}
        </CardHeader>

        <CardContent className="px-5 pb-4 flex-grow flex flex-col">
          {problemPreview && (
            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4 font-medium">
              {problemPreview}
            </p>
          )}

          {/* Support Needed Chips */}
          {supportChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {supportChips.slice(0, 3).map((chip, idx) => (
                <span key={idx} className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <Button variant="outline" className="w-full h-10 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-sm mt-auto">
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StartupCard;
