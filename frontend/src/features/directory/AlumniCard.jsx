import { motion } from "framer-motion";
import { MapPin, MessageCircle, UserPlus, ShieldCheck, User } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { useState } from "react";
import { Link } from "react-router-dom";
import { resolveAlumniImage } from "@/utils/alumniAssets";

const AlumniCard = ({ alumni, onConnect, onMessage, index }) => {
    const [imageError, setImageError] = useState(false);

    const getAvatarUrl = () => {
        if (imageError) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.name)}&background=random&color=fff&size=300`;
        }
        // Use resolveAlumniImage for proper image resolution
        const imageUrl = alumni.image || alumni.photoURL || alumni.avatar || alumni.profilePhoto;
        return resolveAlumniImage(imageUrl, alumni.name);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />

            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                {alumni.isMentor && (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1 items-center px-2 py-0.5 hover:bg-primary/10 transition-colors">
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Mentor</span>
                    </Badge>
                )}
                {alumni.membershipType && (
                    <Badge variant="secondary" className={`${alumni.membershipType === 'LAA Member' ? 'bg-[#FF7F7F]/10 text-[#FF7F7F] border-[#FF7F7F]/20' : 'bg-cyan-100 text-cyan-600 border-cyan-200'} text-[9px] font-bold px-2 py-0.5`}>
                        {alumni.membershipType}
                    </Badge>
                )}
            </div>

            <div className="relative z-10 flex items-center gap-4">
                <Link to={`/profile/${alumni.id}`} className="relative group/avatar shrink-0">
                    <img
                        src={getAvatarUrl()}
                        alt={alumni.name}
                        onError={() => setImageError(true)}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/10 group-hover:ring-primary/40 transition-all duration-500"
                    />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-card rounded-full" title="Online" />
                </Link>
                <div className="flex-1 min-w-0">
                    <Link to={`/profile/${alumni.id}`} className="block">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{alumni.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-1">{alumni.role}</p>
                    <p className="text-xs text-muted-foreground/80 line-clamp-1">{alumni.company}</p>
                </div>
            </div>

            <div className="relative z-10 space-y-3 mt-5">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <span className="line-clamp-1">{alumni.location} · {alumni.department}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center text-[10px] font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        '{String(alumni.graduationYear).slice(2)}
                    </div>
                    <span>Class of {alumni.graduationYear}</span>
                </div>

                {alumni.achievement && (
                    <p className="text-xs text-muted-foreground mt-3 italic line-clamp-2 leading-relaxed border-l-2 border-primary/20 pl-3">
                        "{alumni.achievement}"
                    </p>
                )}
            </div>

            <div className="relative z-10 flex flex-wrap gap-1.5 mt-5 h-14 overflow-hidden">
                {alumni.skills.map((s) => (
                    <span key={s} className="bg-secondary/50 text-secondary-foreground text-[11px] px-2.5 py-1 rounded-lg font-medium border border-transparent group-hover:border-primary/10 transition-all duration-300">
                        {s}
                    </span>
                ))}
            </div>

            <div className="relative z-10 flex gap-3 mt-6">
                <Button
                    className="flex-[2] gradient-primary text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all duration-300 gap-2"
                    onClick={() => onConnect?.(alumni)}
                    disabled={alumni.isNoteworthy}
                >
                    <UserPlus className="h-4 w-4" />
                    <span>{alumni.isNoteworthy ? 'View Profile' : 'Connect'}</span>
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 group/btn"
                    onClick={() => onMessage?.(alumni)}
                    disabled={alumni.isNoteworthy}
                >
                    <MessageCircle className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                </Button>
            </div>
        </motion.div>
    );
};

export default AlumniCard;
