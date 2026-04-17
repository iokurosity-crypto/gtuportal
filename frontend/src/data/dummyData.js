export const alumni = [
  { id: "1", name: "Priya Sharma", graduationYear: 2018, department: "CSE", company: "Google", role: "Senior SDE", location: "Bangalore", avatar: "https://i.pravatar.cc/150?img=1", skills: ["React", "Python", "ML"], isMentor: true, membershipType: "LAA Member" },
  { id: "2", name: "Rahul Verma", graduationYear: 2020, department: "ECE", company: "Microsoft", role: "Product Manager", location: "Hyderabad", avatar: "https://i.pravatar.cc/150?img=3", skills: ["Azure", "Agile", "Data"], isMentor: true },
  { id: "3", name: "Ananya Gupta", graduationYear: 2019, department: "CSE", company: "Amazon", role: "SDE II", location: "Mumbai", avatar: "https://i.pravatar.cc/150?img=5", skills: ["Java", "AWS", "System Design"], isMentor: false },
  { id: "4", name: "Vikram Singh", graduationYear: 2017, department: "IT", company: "Meta", role: "Tech Lead", location: "San Francisco", avatar: "https://i.pravatar.cc/150?img=7", skills: ["React Native", "GraphQL"], isMentor: true, membershipType: "LAA Member" },
  { id: "5", name: "Neha Patel", graduationYear: 2021, department: "CSE", company: "Flipkart", role: "Data Scientist", location: "Bangalore", avatar: "https://i.pravatar.cc/150?img=9", skills: ["Python", "TensorFlow", "NLP"], isMentor: false },
  { id: "6", name: "Arjun Reddy", graduationYear: 2016, department: "ME", company: "Tesla", role: "Design Engineer", location: "Austin", avatar: "https://i.pravatar.cc/150?img=11", skills: ["CAD", "Simulation", "EV"], isMentor: true },
  { id: "7", name: "Aalap S Shah", graduationYear: 2004, department: "Civil Engineering", company: "Independent", role: "Structural Engineer", location: "Ahmedabad", avatar: "https://i.pravatar.cc/150?img=12", skills: ["AutoCAD", "STAAD Pro"], isMentor: true, membershipType: "LAA Member" },
  { id: "8", name: "Aalay Nilesh Desai", graduationYear: 2019, department: "Environmental Engineering", company: "NEERI", role: "Environmental Scientist", location: "Nagpur", avatar: "https://i.pravatar.cc/150?img=13", skills: ["EIA", "Water Treatment"], isMentor: false },
  { id: "9", name: "Aashish Saxena", graduationYear: 1994, department: "Plastic Engineering", company: "Reliance Industries", role: "Project Manager", location: "Vadodara", avatar: "https://i.pravatar.cc/150?img=14", skills: ["Polymers", "Manufacturing"], isMentor: true, membershipType: "Student Member" },
];

export const events = [
  { id: "1", title: "AI & Machine Learning Workshop", date: "2026-03-15", time: "10:00 AM", eventType: "online", meetingLink: "https://zoom.us/j/123456789", contactInfo: "priya.sharma@google.com", postedBy: "Priya Sharma (Google)", description: "Deep dive into modern AI techniques with hands-on exercises." },
  { id: "2", title: "Alumni Networking Meetup 2026", date: "2026-03-22", time: "6:00 PM", eventType: "offline", location: "LDCE Auditorium", contactInfo: "alumni@ldce.edu", postedBy: "Alumni Association", description: "Annual networking event for all batches. Food, talks, and reconnections." },
  { id: "3", title: "Web3 & Blockchain Seminar", date: "2026-04-05", time: "2:00 PM", eventType: "online", meetingLink: "https://meet.google.com/abc-123-def", contactInfo: "vikram.singh@meta.com", postedBy: "Vikram Singh (Meta)", description: "Understanding decentralized applications and smart contracts." },
  { id: "4", title: "Career Guidance Session", date: "2026-02-10", time: "11:00 AM", eventType: "online", meetingLink: "https://teams.microsoft.com/l/meetup-join/456", contactInfo: "rahul.verma@microsoft.com", postedBy: "Rahul Verma (Microsoft)", description: "Tips for cracking product interviews at top companies." },
];

export const blogs = [
  { id: "1", title: "How I Cracked the Amazon SDE Interview", excerpt: "My journey from campus placement preparation to getting an offer from Amazon. Tips on DSA, system design, and behavioral rounds.", author: "Ananya Gupta", authorRole: "SDE II @ Amazon", date: "2026-02-01", tags: ["Career", "Interview"], image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600", readTime: "8 min" },
  { id: "2", title: "From College to Silicon Valley", excerpt: "How networking with alumni helped me land my dream role at a FAANG company in the US.", author: "Vikram Singh", authorRole: "Tech Lead @ Meta", date: "2026-01-20", tags: ["Career", "Abroad"], image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600", readTime: "6 min" },
  { id: "3", title: "Building AI Products That Matter", excerpt: "Lessons learned from building ML-powered features used by millions of users daily.", author: "Priya Sharma", authorRole: "Senior SDE @ Google", date: "2026-01-15", tags: ["Tech", "AI"], image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600", readTime: "10 min" },
];

export const challenges = [
  { id: "1", title: "Data Analytics Challenge", category: "Data Science", deadline: "2026-03-30", externalLink: "https://forms.gle/data-analytics-challenge", contactInfo: "priya.sharma@google.com", description: "Analyze real-world datasets to derive actionable business insights.", postedBy: "Priya Sharma (Google)" },
  { id: "2", title: "Hackathon Campus", category: "IoT / Web", deadline: "2026-04-15", externalLink: "https://forms.gle/campus-hackathon", contactInfo: "rahul.verma@microsoft.com", description: "Build solutions to make campus life smarter and more connected.", postedBy: "Rahul Verma (Microsoft)" },
  { id: "3", title: "UI/UX Design Sprint", category: "Design", deadline: "2026-03-20", externalLink: "https://forms.gle/uiux-sprint", contactInfo: "ananya.gupta@amazon.com", description: "Redesign university mobile app for better student experience.", postedBy: "Ananya Gupta (Amazon)" },
  { id: "4", title: "AI-based Attendance System", category: "AI/Computer Vision", externalLink: "https://forms.gle/ai-attendance-project", contactInfo: "priya.sharma@google.com", description: "Looking for a lightweight, camera-based attendance solution for small teams.", postedBy: "Priya Sharma (Google)", deadline: "2026-05-01" },
  { id: "5", title: "Website for NGO", category: "Web Development", externalLink: "https://forms.gle/ngo-website-project", contactInfo: "rahul.verma@microsoft.com", description: "Need a simple responsive site with donation integration.", postedBy: "Rahul Verma (Microsoft)", deadline: "2026-05-15" },
];

export const startups = [
  { id: "1", name: "EduFlow", founder: "Rahul Verma", domain: "EdTech", stage: "Seed", description: "AI-powered personalized learning paths for students.", lookingFor: ["Frontend Dev", "ML Engineer"] },
  { id: "2", name: "GreenGrid", founder: "Arjun Reddy", domain: "CleanTech", stage: "Pre-Seed", description: "Sustainable energy management for smart buildings.", lookingFor: ["IoT Developer", "Business Dev"] },
];

export const opportunities = [
  { id: "1", title: "Software Intern", company: "Infosys", type: "internship", department: "CSE", domain: "Software Engineering", contactInfo: "careers@infosys.com", applicationLink: "https://forms.gle/infosys-intern-ldce", postedBy: "Vikram Singh" },
  { id: "2", title: "Data Analyst", company: "Deloitte", type: "job", department: "IT", domain: "Data Science", contactInfo: "hr@deloitte.com", applicationLink: "https://deloitte.com/careers/data-analyst-2026", postedBy: "Neha Patel" },
  { id: "3", title: "Frontend Developer", company: "Zomato", type: "job", department: "CSE", domain: "Web Development", contactInfo: "tech@zomato.com", applicationLink: "https://zomato.careers/frontend-sde", postedBy: "Ananya Gupta" },
  { id: "4", title: "App Developer", company: "Meta", type: "freelance", department: "CSE", domain: "Mobile App Development", contactInfo: "hire@meta.com", applicationLink: "https://meta.com/jobs/mobile-dev-remote", postedBy: "Vikram Singh" },
  { id: "5", title: "ML Researcher", company: "Google", type: "internship", department: "CSE", domain: "AI/ML", contactInfo: "research@google.com", applicationLink: "https://forms.gle/google-research-intern", postedBy: "Priya Sharma" },
  { id: "6", title: "Freelance UI Designer", company: "DesignHub", type: "freelance", department: "IT", domain: "Design", contactInfo: "jobs@designhub.com", applicationLink: "https://designhub.io/apply/freelance-ui", postedBy: "Rahul Verma" },
  { id: "7", title: "Structural Consultant", company: "BuiltRight", type: "project", department: "Civil", domain: "Civil Engineering", contactInfo: "admin@builtright.com", applicationLink: "https://forms.gle/civil-consultant-ldce", postedBy: "Aalap S Shah" },
  { id: "8", title: "Cloud Engineer", company: "AWS", type: "job", department: "ECE", domain: "Cloud Computing", contactInfo: "careers@aws.amazon.com", applicationLink: "https://aws.amazon.com/careers/cloud-engineer", postedBy: "Priya Sharma" },
  { id: "9", title: "Product Manager", company: "Microsoft", type: "job", department: "CSE", domain: "Product Management", contactInfo: "careers@microsoft.com", applicationLink: "https://microsoft.com/careers/pm", postedBy: "Rahul Verma" },
  { id: "10", title: "Mechanical Design Engineer", company: "Tesla", type: "job", department: "ME", domain: "Mechanical Engineering", contactInfo: "careers@tesla.com", applicationLink: "https://tesla.com/careers/mechanical", postedBy: "Arjun Reddy" },
];

export const qna = [
  {
    id: "1", question: "How to get funding for a college startup?", askedBy: "Ankit (3rd year)", answers: [
      { id: "a1", author: "Priya Sharma", content: "Start with grants and competitions; build an MVP and reach out to alumni investors.", votes: 12 },
      { id: "a2", author: "Vikram Singh", content: "Validate with users first. A strong demo day pitch helps.", votes: 7 },
    ]
  },
  {
    id: "2", question: "Best roadmap for Data Science in 6 months?", askedBy: "Shruti (2nd year)", answers: [
      { id: "a3", author: "Neha Patel", content: "Focus on Python, stats, projects with Kaggle, and internships via alumni.", votes: 9 },
    ]
  },
];

export const leaderboard = [
  { id: "l1", name: "Priya Sharma", role: "Alumni", avatar: "https://i.pravatar.cc/150?img=1", points: 320, contributions: 18 },
  { id: "l2", name: "Vikram Singh", role: "Alumni", avatar: "https://i.pravatar.cc/150?img=7", points: 280, contributions: 14 },
  { id: "l3", name: "Ananya Gupta", role: "Alumni", avatar: "https://i.pravatar.cc/150?img=5", points: 240, contributions: 12 },
];
