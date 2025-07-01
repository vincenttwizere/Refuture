import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, User, Calendar, MapPin, BookOpen, Award } from 'lucide-react';
import axios from 'axios';

interface Interview {
  _id: string;
  type: string;
  title: string;
  description: string;
  organization: string;
  status: string;
  scheduledDate?: string;
  providerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const RefugeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch interviews
      const interviewsResponse = await axios.get('http://localhost:5001/api/interviews/talent');
      setInterviews(interviewsResponse.data.interviews);

      // Fetch profile if exists
      try {
        const profileResponse = await axios.get('http://localhost:5001/api/profiles/me/my-profile');
        setProfile(profileResponse.data.profile);
      } catch (error) {
        // Profile doesn't exist yet
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewResponse = async (interviewId: string, status: 'accepted' | 'declined', message?: string) => {
    try {
      await axios.put(`http://localhost:5001/api/interviews/${interviewId}/respond`, {
        status,
        message
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error responding to interview:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return <Award className="h-5 w-5" />;
      case 'internship': return <BookOpen className="h-5 w-5" />;
      case 'job': return <User className="h-5 w-5" />;
      case 'mentorship': return <GraduationCap className="h-5 w-5" />;
      default: return <Mail className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.firstName}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-blue-100">
            {profile ? 'Your profile is complete and visible to providers.' : 'Complete your profile to start receiving opportunities.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
                <button
                  onClick={() => navigate('/create-profile')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {profile ? 'Edit' : 'Create'}
                </button>
              </div>

              {profile ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.firstName[0]}{user?.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{profile.personalInfo?.countryOfOrigin}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span>{profile.education?.fieldOfStudy}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Profile Completion</span>
                      <span className="font-medium text-green-600">Complete</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h4>
                  <p className="text-gray-600 mb-4">
                    Create your talent profile to start receiving opportunities from providers.
                  </p>
                  <button
                    onClick={() => navigate('/create-profile')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interviews Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Interview Invitations</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {interviews.length} invitation{interviews.length !== 1 ? 's' : ''} received
                </p>
              </div>

              <div className="p-6">
                {interviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No invitations yet</h4>
                    <p className="text-gray-600">
                      Complete your profile to start receiving interview invitations from providers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviews.map((interview) => (
                      <div key={interview._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {getTypeIcon(interview.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{interview.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{interview.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>{interview.organization}</span>
                                <span>•</span>
                                <span>{interview.providerId.firstName} {interview.providerId.lastName}</span>
                                {interview.scheduledDate && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(interview.scheduledDate).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(interview.status)}`}>
                              {interview.status}
                            </span>
                          </div>
                        </div>

                        {interview.status === 'pending' && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => handleInterviewResponse(interview._id, 'accepted')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleInterviewResponse(interview._id, 'declined')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefugeeDashboard; 