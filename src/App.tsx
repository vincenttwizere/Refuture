import React, { useState } from 'react'
import { 
  User, 
  BarChart3, 
  GraduationCap, 
  Mail, 
  Search, 
  Bell, 
  Settings, 
  BookOpen, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Award,
  Calendar,
  MapPin,
  Star,
  ChevronRight,
  Clock,
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Filter,
  Download,
  Share2
} from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const mockStudentData = {
    name: "Amina Hassan",
    country: "Syria",
    program: "Computer Science",
    progress: 78,
    opportunities: 12,
    mentors: 3,
    rating: 4.8,
    coursesCompleted: 15,
    totalCourses: 20
  }

  const mockOpportunities = [
    { 
      id: 1, 
      title: "Software Developer Intern", 
      company: "TechCorp", 
      location: "Remote", 
      type: "Internship", 
      deadline: "2024-02-15",
      salary: "$25-35/hr",
      applicants: 45,
      isBookmarked: true
    },
    { 
      id: 2, 
      title: "Data Science Fellowship", 
      company: "DataLab", 
      location: "New York", 
      type: "Fellowship", 
      deadline: "2024-03-01",
      salary: "$50,000/year",
      applicants: 23,
      isBookmarked: false
    },
    { 
      id: 3, 
      title: "Web Development Bootcamp", 
      company: "CodeAcademy", 
      location: "Online", 
      type: "Training", 
      deadline: "2024-01-30",
      salary: "Free",
      applicants: 156,
      isBookmarked: true
    }
  ]

  const mockMentors = [
    { id: 1, name: "Dr. Sarah Johnson", field: "Computer Science", company: "Google", rating: 4.9, availability: "Available", avatar: "SJ" },
    { id: 2, name: "Ahmed Al-Masri", field: "Software Engineering", company: "Microsoft", rating: 4.8, availability: "Available", avatar: "AM" },
    { id: 3, name: "Maria Rodriguez", field: "Data Science", company: "Amazon", rating: 4.7, availability: "Busy", avatar: "MR" }
  ]

  const mockEvents = [
    { id: 1, title: "Tech Career Fair", time: "Tomorrow, 2:00 PM", type: "Career", icon: Award, color: "emerald" },
    { id: 2, title: "Study Group Session", time: "Friday, 6:00 PM", type: "Academic", icon: GraduationCap, color: "amber" },
    { id: 3, title: "Mentor Meetup", time: "Next Week", type: "Networking", icon: Users, color: "blue" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-40">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Refuture</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium">
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <BookOpen className="h-5 w-5" />
            <span>Courses</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <Briefcase className="h-5 w-5" />
            <span>Opportunities</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <Users className="h-5 w-5" />
            <span>Mentors</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <Calendar className="h-5 w-5" />
            <span>Events</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            <Award className="h-5 w-5" />
            <span>Progress</span>
          </button>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold">
              {mockStudentData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{mockStudentData.name}</p>
              <p className="text-xs text-gray-500">{mockStudentData.program}</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities, mentors..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Landing
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {mockStudentData.name.split(' ')[0]}! 👋</h2>
            <p className="text-gray-600">Track your progress and discover new opportunities to advance your career.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStudentData.progress}%</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStudentData.opportunities}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mentors</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStudentData.mentors}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStudentData.rating}</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600 fill-current" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Dashboard */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Overview */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Academic Progress</h3>
                  <button className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Course Completion</span>
                      <span className="text-sm font-bold text-gray-900">{mockStudentData.coursesCompleted}/{mockStudentData.totalCourses} courses</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${mockStudentData.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{mockStudentData.opportunities}</div>
                      <div className="text-sm text-blue-700 font-medium">Opportunities</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-600">{mockStudentData.mentors}</div>
                      <div className="text-sm text-emerald-700 font-medium">Mentors</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                      <div className="text-2xl font-bold text-amber-600">{mockStudentData.rating}</div>
                      <div className="text-sm text-amber-700 font-medium">Rating</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunities */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recommended Opportunities</h3>
                    <p className="text-sm text-gray-600 mt-1">Based on your profile and interests</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {mockOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-lg">{opportunity.title}</h4>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Bookmark className={`h-5 w-5 ${opportunity.isBookmarked ? 'text-blue-600 fill-current' : 'text-gray-400'}`} />
                            </button>
                          </div>
                          <p className="text-emerald-600 font-medium text-sm mb-2">{opportunity.company}</p>
                          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {opportunity.location}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {opportunity.deadline}
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {opportunity.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{opportunity.salary}</span>
                            <span className="text-sm text-gray-500">{opportunity.applicants} applicants</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
                        <button className="bg-amber-500 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex-1">
                          Apply Now
                        </button>
                        <button className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>View Courses</span>
                  </button>
                  <button className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Find Mentors</span>
                  </button>
                  <button className="w-full bg-amber-500 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-amber-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>

              {/* Available Mentors */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Available Mentors</h3>
                  <button className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {mockMentors.map((mentor) => (
                    <div key={mentor.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold">
                          {mentor.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{mentor.name}</h4>
                          <p className="text-sm text-emerald-600 font-medium">{mentor.field}</p>
                          <p className="text-xs text-gray-500">{mentor.company}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-amber-500 fill-current" />
                          <span className="text-sm font-medium">{mentor.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          mentor.availability === 'Available' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {mentor.availability}
                        </span>
                        <button className="bg-emerald-600 text-white px-3 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm hover:shadow-md text-sm">
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
                  <button className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {mockEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`h-10 w-10 bg-${event.color}-100 rounded-xl flex items-center justify-center`}>
                        <event.icon className={`h-5 w-5 text-${event.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.time}</p>
                      </div>
                      <button className="bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-xs">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 