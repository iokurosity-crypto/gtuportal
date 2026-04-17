import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-background py-12 mt-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AluVerse</span>
          </div>
          <p className="text-sm opacity-70">
            Connecting alumni and students for mentorship, opportunities, and growth.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Explore</h4>
          <div className="space-y-2 text-sm opacity-70">
            <Link to="/events" className="block hover:opacity-100">Events</Link>
            <Link to="/alumni" className="block hover:opacity-100">Alumni Directory</Link>
            <Link to="/feed" className="block hover:opacity-100">Feed</Link>
            <Link to="/challenges" className="block hover:opacity-100">Challenges</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Community</h4>
          <div className="space-y-2 text-sm opacity-70">
            <Link to="/startups" className="block hover:opacity-100">Startups</Link>
            <span className="block">Mentorship</span>
            <span className="block">Opportunities</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <div className="space-y-2 text-sm opacity-70">
            <p>alumni@university.edu</p>
            <p>+91 98765 43210</p>
          </div>
        </div>
      </div>
      <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm opacity-50">
        © 2026 AluVerse. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
