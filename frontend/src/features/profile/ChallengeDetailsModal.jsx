import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Award, Calendar, ExternalLink, Mail, User } from "lucide-react";

const ChallengeDetailsModal = ({ open, onOpenChange, challenge }) => {
    if (!challenge) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="h-6 w-6 text-orange-600" />
                        {challenge.title}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <User className="h-4 w-4" />
                            Posted by {challenge.postedByName || 'Alumni'}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            challenge.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                            {challenge.status}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-2">About this Challenge</h3>
                        <p className="text-slate-600 leading-relaxed">{challenge.description}</p>
                    </div>

                    {/* How to Apply */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">How to Participate</h3>
                        <div className="space-y-3">
                            {challenge.registrationLink && (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <ExternalLink className="h-5 w-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">Register Online</p>
                                        <p className="text-xs text-slate-600">Click to visit registration page</p>
                                    </div>
                                </div>
                            )}
                            
                            {challenge.contactEmail && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <Mail className="h-5 w-5 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">Email Solution</p>
                                        <p className="text-xs text-slate-600">Send your solution to</p>
                                        <p className="text-sm text-blue-600">{challenge.contactEmail}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => window.open(`mailto:${challenge.contactEmail}`, '_blank')}
                                    >
                                        Send Email
                                    </Button>
                                </div>
                            )}

                            {!challenge.registrationLink && !challenge.contactEmail && (
                                <p className="text-slate-500 text-sm italic">Contact information not provided</p>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChallengeDetailsModal;
