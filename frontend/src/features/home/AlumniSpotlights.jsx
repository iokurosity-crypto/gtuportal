import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui";
import { Award, Briefcase, MapPin, Link as LinkIcon, ChevronRight, ChevronLeft } from "lucide-react";
import noteworthyAlumni from "@/data/noteworthyAlumni.json";
import { useState, useEffect, useRef } from "react";
import { resolveAlumniImage } from "@/utils/alumniAssets";

const AlumniSpotlights = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Show 2 alumni per slide on large screens, 1 on smaller
  const featuredAlumni = noteworthyAlumni?.slice(0, 12) || [];
  const itemsPerSlide = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 2 : 1;
  const totalSlides = Math.ceil(featuredAlumni.length / itemsPerSlide);

  // Get current alumni to display
  const getCurrentAlumni = () => {
    const startIdx = currentIndex * itemsPerSlide;
    return featuredAlumni.slice(startIdx, startIdx + itemsPerSlide);
  };

  // Navigation handlers with pause/resume
  const handleNavigation = (direction) => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);

    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    } else {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }

    setIsPaused(true);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 6000);
  };

  const handleDotClick = (index) => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);

    setCurrentIndex(index);
    setIsPaused(true);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 6000);
  };

  // Auto-play with slow 6-second transitions
  useEffect(() => {
    if (!isPaused) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 6000);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, totalSlides]);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full py-16 md:py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Distinguished Alumni Spotlight
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating our remarkable alumni making an impact across industries and continents
          </p>
        </motion.div>

        {/* Alumni Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featuredAlumni.map((alumni, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  {/* Alumni Photo */}
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={resolveAlumniImage(alumni.image, alumni.name)}
                      alt={alumni.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      onLoad={(e) => console.log('Image loaded:', alumni.name, e.target.src)}
                      onError={(e) => {
                        console.log('Image failed to load:', alumni.name, alumni.image);
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alumni.name)}&background=random&color=fff&size=300&bold=true`;
                      }}
                    />
                  </div>

                  {/* Alumni Info */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{alumni.name}</h3>

                  {/* Title & Company */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{alumni.position || alumni.title || "Professional"}</p>
                        <p className="text-xs text-gray-600">{alumni.department || alumni.company || "LDCE Alumni"}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {(alumni.location || alumni.batch) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-xs text-gray-600">{alumni.location || `Batch ${alumni.batch}`}</p>
                      </div>
                    )}
                  </div>

                  {/* Achievement/Highlight */}
                  {(alumni.achievement || alumni.bio) && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-4 border-l-4 border-purple-600">
                      <div className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700">{alumni.achievement || alumni.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {alumni.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{alumni.bio}</p>
                  )}

                  {/* Social Links */}
                  {(alumni.linkedin || alumni.website) && (
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      {alumni.linkedin && (
                        <a
                          href={alumni.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <LinkIcon className="w-3 h-3" />
                          LinkedIn
                        </a>
                      )}
                      {alumni.website && (
                        <a
                          href={alumni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AlumniSpotlights;
