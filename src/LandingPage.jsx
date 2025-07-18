import React, { useState, useEffect } from 'react'
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Award,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Heart,
  Shield,
  BookOpen,
  MessageCircle,
  Play,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Search,
  Menu,
  X
} from 'lucide-react'

function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("idle"); // idle | success | error

  // Add state for mobile nav
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const features = [
    {
      icon: GraduationCap,
      title: "Academic Progress Tracking",
      description: "Monitor your course completion, grades, and learning milestones with detailed analytics and progress visualization.",
      color: "blue"
    },
    {
      icon: Briefcase,
      title: "Career Opportunities",
      description: "Discover internships, fellowships, and job opportunities tailored to your skills and educational background.",
      color: "emerald"
    },
    {
      icon: Users,
      title: "Mentor Connection",
      description: "Connect with industry professionals and educators who can guide your academic and career journey.",
      color: "purple"
    },
    {
      icon: Award,
      title: "Skill Development",
      description: "Access training programs, workshops, and resources to enhance your professional skills and competencies.",
      color: "amber"
    }
  ]

  const testimonials = [
    {
      name: "Amina Hassan",
      country: "Syria",
      program: "Computer Science",
      rating: 5,
      text: "Refuture helped me find my dream internship at a tech company. The mentor connection program was invaluable in guiding my career path.",
      avatar: "AH"
    },
    {
      name: "Ahmed Al-Masri",
      country: "Egypt",
      program: "Data Science",
      rating: 5,
      text: "The platform's progress tracking kept me motivated throughout my studies. I'm now working as a data analyst thanks to the opportunities I found here.",
      avatar: "AM"
    },
    {
      name: "Maria Rodriguez",
      country: "Venezuela",
      program: "Software Engineering",
      rating: 5,
      text: "Refuture connected me with amazing mentors who helped me navigate the tech industry. The community support is incredible.",
      avatar: "MR"
    }
  ]

  const stats = [
    { number: "2,500+", label: "Students Helped" },
    { number: "150+", label: "Partner Organizations" },
    { number: "300+", label: "Active Mentors" },
    { number: "95%", label: "Success Rate" }
  ]

  // Phone frame carousel state
  const phoneMockups = [
    // Dashboard
    (
      <>
        <div className="bg-blue-600 text-white text-center py-3 font-semibold text-base">Refuture</div>
        <div className="bg-white mx-4 mt-4 rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-xs text-gray-500">Profile Completion</span>
          <span className="text-2xl font-bold text-blue-600 mt-1">85%</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div className="px-4 mt-6">
          <div className="font-semibold text-gray-800 text-sm mb-2">Opportunity</div>
          <div className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Scholarship</div>
              <div className="font-medium text-gray-900 text-sm">Tech for Good</div>
            </div>
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Open</span>
          </div>
        </div>
        <div className="p-4 mt-auto">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">View Dashboard</button>
        </div>
      </>
    ),
    // Messages
    (
      <>
        <div className="bg-blue-600 text-white text-center py-3 font-semibold text-base">Messages</div>
        <div className="px-4 mt-6">
          <div className="font-semibold text-gray-800 text-sm mb-2">Inbox</div>
          <div className="bg-white rounded-lg shadow p-3 flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-2 text-xs">A</div>
            <div className="flex-1">
              <div className="text-xs text-gray-500">Admin</div>
              <div className="text-xs text-gray-700 truncate">Welcome to Refuture!</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 flex items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold mr-2 text-xs">M</div>
            <div className="flex-1">
              <div className="text-xs text-gray-500">Mentor</div>
              <div className="text-xs text-gray-700 truncate">Let's schedule a call!</div>
            </div>
          </div>
        </div>
        <div className="p-4 mt-auto">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">Go to Messages</button>
        </div>
      </>
    ),
    // Opportunities
    (
      <>
        <div className="bg-blue-600 text-white text-center py-3 font-semibold text-base">Opportunities</div>
        <div className="px-4 mt-6">
          <div className="font-semibold text-gray-800 text-sm mb-2">Featured</div>
          <div className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Internship</div>
                <div className="font-medium text-gray-900 text-sm">Data Science Intern</div>
              </div>
              <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full">Open</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Scholarship</div>
                <div className="font-medium text-gray-900 text-sm">Women in Tech</div>
              </div>
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Open</span>
            </div>
          </div>
        </div>
        <div className="p-4 mt-auto">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">See All</button>
        </div>
      </>
    ),
    // Profile
    (
      <>
        <div className="bg-blue-600 text-white text-center py-3 font-semibold text-base">Profile</div>
        <div className="flex flex-col items-center mt-8">
          <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-3xl mb-2">A</div>
          <div className="font-bold text-gray-900 text-lg">Amina Hassan</div>
          <div className="text-xs text-gray-500 mb-4">Computer Science • Syria</div>
          <div className="bg-white rounded-lg shadow p-3 w-full text-center">
            <div className="text-xs text-gray-500">Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="text-xs text-gray-700">85% Complete</div>
          </div>
        </div>
        <div className="p-4 mt-auto">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">Edit Profile</button>
        </div>
      </>
    ),
  ];
  const [currentMockup, setCurrentMockup] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMockup((prev) => (prev + 1) % phoneMockups.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Refuture</h1>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Success Stories</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</a>
            </div>
            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileNavOpen ? (
                  <X className="h-7 w-7 text-gray-700" />
                ) : (
                  <Menu className="h-7 w-7 text-gray-700" />
                )}
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-blue-600 text-white px-3 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Nav Overlay (as sibling, not child) */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="bg-white bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-2xl rounded-2xl w-11/12 max-w-xs p-6 flex flex-col space-y-4 animate-slide-down relative"
            style={{ minHeight: 340 }}
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <X className="h-7 w-7 text-gray-700" />
            </button>
            <span className="text-lg font-bold text-gray-900 mb-2 mt-2 text-center">Menu</span>
            <a href="#features" className="text-gray-700 px-2 py-2 rounded hover:bg-blue-50 font-medium text-center" onClick={() => setMobileNavOpen(false)}>Features</a>
            <a href="#about" className="text-gray-700 px-2 py-2 rounded hover:bg-blue-50 font-medium text-center" onClick={() => setMobileNavOpen(false)}>About</a>
            <a href="#testimonials" className="text-gray-700 px-2 py-2 rounded hover:bg-blue-50 font-medium text-center" onClick={() => setMobileNavOpen(false)}>Success Stories</a>
            <a href="#contact" className="text-gray-700 px-2 py-2 rounded hover:bg-blue-50 font-medium text-center" onClick={() => setMobileNavOpen(false)}>Contact</a>
            <button 
              onClick={() => { setMobileNavOpen(false); window.location.href = '/signup'; }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm mt-2"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 md:gap-0">
            {/* Left: Text Content */}
            <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center items-center md:items-start mb-8 md:mb-0 px-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 drop-shadow-lg">
                <span className="block">Empowering Refugee Talents</span>
                <span className="block">to Build Their Future</span>
              </h1>
              <p className="text-base md:text-lg text-gray-700 mb-8 max-w-2xl mx-auto md:mx-0 font-medium" style={{ fontWeight: 400, color: 'rgb(55, 65, 81)', fontSize: '14px', lineHeight: '20px' }}>
                Refuture connects refugees with education, mentors, and career opportunities,<br />
                all in one supportive community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center md:items-start w-full mb-6">
                <button 
                  onClick={() => window.location.href = '/signup'}
                  className="bg-blue-600 text-white px-3 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 text-base"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-gray-700 text-sm">For Refugees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-gray-700 text-sm">For Academic Institutions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-gray-700 text-sm">For Employers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-gray-700 text-sm">For Mentors</span>
                </div>
              </div>
            </div>
            {/* Right: Phone Frame Section */}
            <div className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0">
              <div className="relative flex flex-col items-center justify-center w-full max-w-xs" style={{ minHeight: 320 }}>
                {/* Phone Frame */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 p-2 w-full max-w-[280px] h-[400px] sm:h-[460px] md:h-[500px] flex items-center justify-center">
                  {/* App UI Mockup - Carousel */}
                  <div className="w-[180px] sm:w-[220px] md:w-[240px] h-[360px] sm:h-[420px] md:h-[460px] rounded-[2rem] bg-gray-50 flex flex-col overflow-hidden border border-gray-100 shadow-md relative">
                    {phoneMockups[currentMockup]}
                  </div>
                </div>
                {/* Speaker/Camera Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-2 bg-gray-200 rounded-full opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Our Mission Card on the left */}
            <div className="relative order-1 lg:order-1 flex justify-center items-center" style={{ height: '500px' }}>
              {/* Phone Frame */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 p-2 w-[280px] h-[500px] flex items-center justify-center">
                {/* Inner Card Content */}
                <div className="w-[240px] h-[460px] rounded-[2rem] bg-gray-50 flex flex-col overflow-hidden border border-gray-100 shadow-md p-8">
                  <div className="flex flex-col items-center mb-6">
                    <Heart className="h-7 w-7 text-blue-600 mb-2" />
                    <h3 className="text-lg font-bold text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '16px', lineHeight: '24px', textAlign: 'justify' }}>
                    At Refuture, we're committed to breaking down barriers and creating pathways for refugee talents to access quality education, mentorship, and meaningful employment. By empowering continuous learning and connection, we help you reclaim your future with purpose and dignity. Join Refuture and start shaping what's next today.
                  </p>
                </div>
                {/* Speaker/Camera Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-gray-200 rounded-full opacity-70" />
              </div>
            </div>
            {/* About Content on the right */}
            <div className="order-2 lg:order-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Building Bridges to Brighter Futures</h2>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Refuture is dedicated to empowering refugee students by providing access to quality education, 
                career opportunities, and mentorship. We believe that every student deserves the chance to 
                build a successful future, regardless of their background or circumstances.
              </p>
              <div className="space-y-4 md:ml-12">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <span className="text-gray-700">Personalized learning paths</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <span className="text-gray-700">Industry mentor connections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <span className="text-gray-700">Career opportunity matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <span className="text-gray-700">Community support network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides the tools, resources, and connections 
              you need to achieve your educational and career goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Academic Progress Tracking */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col items-center justify-center text-center">
              <GraduationCap className="h-7 w-7 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Progress Tracking</h3>
              <p className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>
                Monitor your course completion, grades, and learning milestones with detailed analytics and easy-to-understand progress visualization. Stay motivated as you see your achievements grow over time.
              </p>
            </div>
            {/* Career Opportunities */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col items-center justify-center text-center">
              <Briefcase className="h-7 w-7 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">Career Opportunities</h3>
              <p className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>
                Discover internships, fellowships, and job opportunities tailored to your skills and educational background. Apply directly and track your applications all in one place.
              </p>
            </div>
            {/* Mentor Connection */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col items-center justify-center text-center">
              <Users className="h-7 w-7 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">Mentor Connection</h3>
              <p className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>
                Connect with industry professionals and educators who can guide your academic and career journey. Get advice, feedback, and support from mentors who care about your success.
              </p>
            </div>
            {/* Skill Development */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col items-center justify-center text-center">
              <Award className="h-7 w-7 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Development</h3>
              <p className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>
                Access training programs, workshops, and resources to enhance your professional skills and competencies. Build confidence and unlock new opportunities for growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How Refuture Works</h2>
            <p className="text-gray-600 text-base">Get started in just a few steps and unlock your future.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 gap-x-10">
            {/* Step 1: Sign Up */}
            <div className="flex flex-col items-center text-center max-w-xs w-full mx-auto">
              <UserPlus className="h-7 w-7 text-blue-600 mb-3" />
              <div className="font-semibold text-gray-900 mb-1 text-base">Sign Up</div>
              <div className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>Create your free account, set up your profile, and let us know your interests and goals to personalize your experience.</div>
            </div>
            {/* Step 2: Explore */}
            <div className="flex flex-col items-center text-center max-w-xs w-full mx-auto">
              <Search className="h-7 w-7 text-blue-600 mb-3" />
              <div className="font-semibold text-gray-900 mb-1 text-base">Explore</div>
              <div className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>Browse a curated list of scholarships, jobs, and training programs tailored to your background and aspirations.</div>
            </div>
            {/* Step 3: Connect */}
            <div className="flex flex-col items-center text-center max-w-xs w-full mx-auto">
              <Users className="h-7 w-7 text-blue-600 mb-3" />
              <div className="font-semibold text-gray-900 mb-1 text-base">Connect</div>
              <div className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>Meet mentors, join community groups, and get support from people who understand your journey and want to help you succeed.</div>
            </div>
            {/* Step 4: Succeed */}
            <div className="flex flex-col items-center text-center max-w-xs w-full mx-auto">
              <CheckCircle className="h-7 w-7 text-blue-600 mb-3" />
              <div className="font-semibold text-gray-900 mb-1 text-base">Succeed</div>
              <div className="text-xs text-gray-600" style={{ fontWeight: 400, color: 'rgb(61, 61, 78)', fontSize: '14px', lineHeight: '20px', textAlign: 'justify' }}>Apply for opportunities, track your progress, and celebrate your achievements as you move forward in your new home.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-base text-gray-600">
              Hear from refugee students who have transformed their lives through Refuture
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start px-2">
            {/* Left: Testimonial Card and Buttons */}
            <div className="w-full max-w-sm mx-auto flex flex-col items-start">
              <div className="bg-white rounded-2xl p-8 shadow-lg w-full h-[400px] flex flex-col justify-between">
                <div className="flex mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-base text-gray-700 mb-8 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].program} • {testimonials[currentTestimonial].country}</p>
                  </div>
                </div>
              </div>
              {/* Next/Previous Buttons Below Card, centered */}
              <div className="flex space-x-4 mt-4 justify-center w-full max-w-sm">
                <button 
                  onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            {/* Right: Contact Form */}
            <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-start">
              <form
                className="bg-white rounded-2xl p-8 shadow-lg w-full h-[400px] flex flex-col justify-between overflow-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onSubmit={async e => {
                  e.preventDefault();
                  try {
                    const res = await fetch('/api/contact', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: contactName,
                        email: contactEmail,
                        message: contactMessage,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setContactStatus("success");
                      setContactName("");
                      setContactEmail("");
                      setContactMessage("");
                      setTimeout(() => setContactStatus("idle"), 4000);
                    } else {
                      setContactStatus("error");
                    }
                  } catch (err) {
                    setContactStatus("error");
                  }
                }}
              >
                <style>{`form::-webkit-scrollbar { display: none; }`}</style>
                {contactStatus === "success" && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-100 text-emerald-800 text-sm text-center font-medium border border-emerald-200">
                    Your message has been sent!
                  </div>
                )}
                {contactStatus === "error" && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 text-sm text-center font-medium border border-red-200">
                    Failed to send your message. Please try again later.
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Contact Us</h3>
                <div className="mb-4">
                  <label htmlFor="contact-name" className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Name"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="contact-email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@email.com"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-message" className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How can we help you?"
                    required
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-medium text-base hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={contactStatus === "success"}
                >
                  {contactStatus === "success" ? "Sent!" : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-base text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of refugee students who are building their futures with Refuture. 
            Take the first step towards your dreams today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Your Profile
            </button>
            <button 
              className="bg-transparent text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 border border-white/30"
              onClick={() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row md:flex-wrap gap-8">
            <div className="flex-1 min-w-[180px] mb-8 sm:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold">Refuture</h3>
              </div>
              <p className="text-gray-400">
                Empowering refugee students to build brighter futures through education, 
                mentorship, and opportunity.
              </p>
            </div>
            <div className="flex-1 min-w-[180px] mb-8 sm:mb-0">
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Opportunities</a></li>
              </ul>
            </div>
            <div className="flex-1 min-w-[180px] mb-8 sm:mb-0">
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            <div className="flex-1 min-w-[180px]">
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Volunteer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Donate</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-xs sm:text-sm">
            <p>&copy; 2025 Refuture. All rights reserved. Building bridges to brighter futures.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 