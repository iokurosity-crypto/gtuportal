import React, { useState } from 'react';
import { MapPin, Briefcase, Clock, DollarSign, ExternalLink, Bookmark, ShieldCheck, Calendar } from 'lucide-react';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { cn } from '@/utils';

const OpportunityCard = ({ opportunity, onApply, onSave, onViewDetails }) => {
  const [isSaved, setIsSaved] = useState(opportunity.saved);

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) onSave(opportunity.id, !isSaved);
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    // Navigate to details page instead of direct redirect
    if (onViewDetails) {
      onViewDetails(opportunity.id);
    } else if (onApply) {
      onApply(opportunity.id);
    }
  };

  return (
    <Card
      onClick={() => onViewDetails && onViewDetails(opportunity.id)}
      className="group bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden rounded-xl"
    >
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 p-2 overflow-hidden bg-white shadow-sm group-hover:border-blue-200 transition-colors">
                <img
                  src={opportunity.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(opportunity.company)}&background=f0f7ff&color=005eb8&bold=true`}
                  alt={opportunity.company}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                  {opportunity.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium text-sm">{opportunity.company}</span>
                  {opportunity.verified && (
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className={cn(
                "rounded-full transition-all",
                isSaved ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Briefcase className="h-4 w-4" />
              <span className="truncate">{opportunity.type}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="h-4 w-4" />
              <span className="truncate font-semibold text-gray-700">{opportunity.salary || opportunity.stipend || 'Not disclosed'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{opportunity.location} ({opportunity.workMode})</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="truncate">Deadline: {opportunity.deadline}</span>
            </div>
          </div>

          {opportunity.skills && (
            <div className="flex flex-wrap gap-2 mb-6">
              {opportunity.skills.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-50 text-gray-600 border-none font-normal">
                  {skill}
                </Badge>
              ))}
              {opportunity.skills.length > 3 && (
                <span className="text-xs text-gray-400 flex items-center">+{opportunity.skills.length - 3} more</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Clock className="h-3 w-3" />
              <span>{opportunity.postedDate || 'Posted recently'}</span>
            </div>
            <Button
              onClick={handleApplyClick}
              className={cn(
                "px-6 rounded-full font-bold transition-all shadow-sm",
                opportunity.applied
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md"
              )}
            >
              {opportunity.applied ? '✓ Applied' : 'Apply Now'}
              {!opportunity.applied && <ExternalLink className="h-3.5 w-3.5 ml-2" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
