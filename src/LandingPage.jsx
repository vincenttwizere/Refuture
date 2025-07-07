import React, { useState } from 'react'
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
  ChevronLeft
} from 'lucide-react'

function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Refuture</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Success Stories</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/login'}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Empowering Refugee Students to Build Their Future
            </h1>
            <p className="text-base text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with educational opportunities, career mentors, and a supportive community. 
              Track your progress and discover pathways to success in your new home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 border border-gray-200">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
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
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Building Bridges to Brighter Futures</h2>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Refuture is dedicated to empowering refugee students by providing access to quality education, 
                career opportunities, and mentorship. We believe that every student deserves the chance to 
                build a successful future, regardless of their background or circumstances.
              </p>
              
              <div className="space-y-4">
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
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Our Mission</h3>
                    <p className="text-sm text-gray-600">Empowering refugee talents worldwide</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We're committed to breaking down barriers and creating opportunities for refugee students 
                  to access quality education and meaningful careers. Join our community and start building 
                  your future today.
                </p>
              </div>
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
          
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-base text-gray-700 mb-8 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].program} • {testimonials[currentTestimonial].country}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mt-8">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-800">
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
            <button className="bg-transparent text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 border border-white/30">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold">Refuture</h3>
              </div>
              <p className="text-gray-400">
                Empowering refugee students to build brighter futures through education, 
                mentorship, and opportunity.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Opportunities</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Volunteer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Donate</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Refuture. All rights reserved. Building bridges to brighter futures.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 