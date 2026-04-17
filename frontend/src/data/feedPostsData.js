// Professional Tech-Related Feed Posts for AluVerse
export const feedPostsData = [
  {
    id: "1",
    author: {
      id: "author_1",
      name: "Priya Sharma",
      role: "Senior SDE @ Google",
      company: "Google",
      avatar: "https://i.pravatar.cc/150?img=32",
      graduation: "2018"
    },
    content: "Just completed a challenging project on AI-powered recommendations! 🚀\n\nKey learnings:\n✓ Balancing model complexity with latency\n✓ A/B testing frameworks for ML\n✓ Scaling from millions to billions of interactions\n\nIf you're interested in ML engineering, don't wait for the perfect opportunity - start building now! The industry needs more engineers who can bridge theory and production.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    likes: 342,
    comments: 28,
    shares: 15,
    type: "experience",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    liked: false
  },
  {
    id: "2",
    author: {
      id: "author_2",
      name: "Rahul Verma",
      role: "Product Manager @ Microsoft",
      company: "Microsoft",
      avatar: "https://i.pravatar.cc/150?img=25",
      graduation: "2020"
    },
    content: "📊 Exciting news! We just launched Azure's new AI services that make machine learning 5x easier for enterprises.\n\n🔥 What's new:\n• No-code ML pipeline builder\n• Integrated data governance\n• Real-time monitoring dashboard\n\nOpenings for Senior PMs & engineers at our Hyderabad office! DM for referrals.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop",
    likes: 521,
    comments: 45,
    shares: 32,
    type: "opportunity",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    liked: false
  },
  {
    id: "3",
    author: {
      id: "author_3",
      name: "Ananya Gupta",
      role: "SDE II @ Amazon",
      company: "Amazon",
      avatar: "https://i.pravatar.cc/150?img=47",
      graduation: "2019"
    },
    content: "From struggling with DSA in 2nd year to cracking Amazon, Google & Microsoft in final placements - it's possible! 💪\n\nMy 6-month internship journey:\n• Started with basics of trees & graphs\n• Practiced 300+ LeetCode problems\n• Focused on understanding, not memorizing\n• Mock interviews every week\n\nTo all 2nd & 3rd year students: Start NOW. Your future self will thank you! 🎯",
    image: "https://images.unsplash.com/photo-1516534775068-bb4a32db4d5b?w=800&h=500&fit=crop",
    likes: 892,
    comments: 156,
    shares: 203,
    type: "motivational",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    liked: false
  },
  {
    id: "4",
    author: {
      id: "author_4",
      name: "Vikram Singh",
      role: "Tech Lead @ Meta",
      company: "Meta",
      avatar: "https://i.pravatar.cc/150?img=38",
      graduation: "2017"
    },
    content: "🌍 Game-changer for the web: Chromium's new 'View Transitions API' is here!\n\nWhat it means:\n→ Smooth page transitions without leaving web for native apps\n→ Better UX across all devices\n→ Only 50 lines of CSS to implement\n\nThis is how the web is catching up with mobile. The future of frontend development just got more exciting! 🚀",
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=500&fit=crop",
    likes: 445,
    comments: 67,
    shares: 89,
    type: "tech_trend",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    liked: false
  },
  {
    id: "5",
    author: {
      id: "author_5",
      name: "Neha Patel",
      role: "Data Scientist @ Flipkart",
      company: "Flipkart",
      avatar: "https://i.pravatar.cc/150?img=53",
      graduation: "2021"
    },
    content: "🎯 We're hiring! Flipkart is looking for talented engineers to build next-gen recommendation systems.\n\nWhat we work on:\n• Processing 1B+ events daily\n• Real-time personalization\n• Working with cutting-edge tech stack\n\nIdeal candidates:\n✓ Strong fundamentals in distributed systems\n✓ Experience with Python/Scala/Java\n✓ Passion for solving real problems at scale\n\nInterested? Let's connect! 🤝",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop",
    likes: 267,
    comments: 34,
    shares: 21,
    type: "opportunity",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    liked: false
  },
  {
    id: "6",
    author: {
      id: "author_6",
      name: "Arjun Reddy",
      role: "Design Engineer @ Tesla",
      company: "Tesla",
      avatar: "https://i.pravatar.cc/150?img=41",
      graduation: "2016"
    },
    content: "🔋 The EV revolution isn't just about batteries - it's about rethinking entire design paradigms\n\nWhat I learned in 3 years at Tesla:\n1. Mechanical excellence at 10,000 parts is harder than software\n2. Simulation > prototyping (saves 6 months & millions)\n3. Every millimeter counts when efficiency = range\n4. Cross-functional collaboration is key to innovation\n\nIf you love engineering, consider automotive tech. It's the future! ⚡",
    image: "https://images.unsplash.com/photo-1553531088-4f39223c2b4e?w=800&h=500&fit=crop",
    likes: 634,
    comments: 89,
    shares: 112,
    type: "experience",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    liked: false
  },
  {
    id: "7",
    author: {
      id: "author_7",
      name: "Aalap S Shah",
      role: "Structural Engineer @ Independent",
      company: "Independent",
      avatar: "https://i.pravatar.cc/150?img=2",
      graduation: "2004"
    },
    content: "🏗️ 20 years in structural engineering taught me one thing: Every failure is a lesson in disguise.\n\nDuring my 1st big bridge project, we had to scrap 6 months of work due to foundation calculations. Instead of losing hope:\n→ Learned new simulation software\n→ Built stronger relationships with contractors\n→ Now I mentor junior engineers on this exact problem\n\nYour 'failures' in college are your greatest assets. Embrace them! 💪",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=500&fit=crop",
    likes: 521,
    comments: 73,
    shares: 98,
    type: "motivational",
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    liked: false
  },
  {
    id: "8",
    author: {
      id: "author_8",
      name: "Priya Sharma",
      role: "Senior SDE @ Google",
      company: "Google",
      avatar: "https://i.pravatar.cc/150?img=32",
      graduation: "2018"
    },
    content: "📢 Breaking: Google announced new LLM training techniques that could reduce energy consumption by 40%!\n\nThis changes the game:\n✓ Smaller, more efficient models\n✓ Better performance with less compute\n✓ Democratizes ML access for smaller companies\n\nThe implications:\n→ Faster innovation cycles\n→ Lower costs for AI startups\n→ Environment-friendly computing\n\nExciting times for ML engineers! 🤖",
    image: "https://images.unsplash.com/photo-1620712014386-a46603b97e4a?w=800&h=500&fit=crop",
    likes: 789,
    comments: 124,
    shares: 231,
    type: "tech_trend",
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    liked: false
  },
  {
    id: "9",
    author: {
      id: "author_9",
      name: "Rahul Verma",
      role: "Product Manager @ Microsoft",
      company: "Microsoft",
      avatar: "https://i.pravatar.cc/150?img=25",
      graduation: "2020"
    },
    content: "💡 Biggest lesson from my transition from SDE to PM:\n\nIt's not about knowing everything - it's about asking the right questions.\n\nAs an SDE, I solved: \"How do we build this?\"\nAs a PM, I solve: \"Should we build this?\"\n\nThe shift from execution to strategy was challenging but rewarding. If you want to explore PM roles early:\n✓ Think about customer problems\n✓ Data-driven decision making\n✓ Cross-functional leadership\n\nNeed PM mentorship? Happy to help! 🤝",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop",
    likes: 456,
    comments: 92,
    shares: 143,
    type: "experience",
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    liked: false
  },
  {
    id: "10",
    author: {
      id: "author_10",
      name: "Neha Patel",
      role: "Data Scientist @ Flipkart",
      company: "Flipkart",
      avatar: "https://i.pravatar.cc/150?img=53",
      graduation: "2021"
    },
    content: "🚀 Live now: GenAI Bootcamp by Flipkart for LDCE students!\n\nWhat you'll learn:\n✓ Building with LLMs (OpenAI, Gemini)\n✓ RAG architectures for real-world use\n✓ Production ML pipelines\n✓ Direct mentorship from Flipkart engineers\n\n⏰ Limited seats available\n📍 Starts next Monday\n🎁 Top performers get internship offers!\n\nApply here: [link in comments]\n\nDon't miss this! 🔥",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    likes: 612,
    comments: 201,
    shares: 187,
    type: "opportunity",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    liked: false
  }
];
