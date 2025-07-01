import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Mail, Eye, MapPin, GraduationCap, Star } from 'lucide-react';
import axios from 'axios';

interface Talent {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  personalInfo: {
    countryOfOrigin: string;
    currentLocation?: {
      city: string;
      country: string;
    };
    bio?: string;
  };
  education: {
    highestLevel: string;
    fieldOfStudy: string;
    institution?: string;
    gpa?: number;
  };
  skills: Array<{
    name: string;
    level: string;
    category: string;
  }>;
  availability: string;
  lastUpdated: string;
}

const ProviderDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    fieldOfStudy: '',
    skill: '',
    availability: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchTalents();
  }, [currentPage, filters]);

  const fetchTalents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filters
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`http://localhost:5001/api/profiles/talents?${params}`);
      setTalents(response.data.profiles);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching talents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTalents();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleInvite = async (talentId: string, inviteData: any) => {
    try {
      await axios.post('http://localhost:5001/api/interviews/invite', {
        talentId,
        ...inviteData
      });
      setShowInviteModal(false);
      setSelectedTalent(null);
      // Show success message
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      // Show error message
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-green-600 bg-green-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
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
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search talents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              <option value="Syria">Syria</option>
              <option value="Egypt">Egypt</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Ukraine">Ukraine</option>
            </select>

            <select
              value={filters.fieldOfStudy}
              onChange={(e) => handleFilterChange('fieldOfStudy', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Fields</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Business">Business</option>
            </select>

            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Availability</option>
              <option value="immediately">Immediately</option>
              <option value="within_3_months">Within 3 months</option>
              <option value="within_6_months">Within 6 months</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>

        {/* Talents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading talents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((talent) => (
              <div key={talent._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {talent.userId.firstName} {talent.userId.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{talent.userId.email}</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-semibold">
                      {talent.userId.firstName[0]}{talent.userId.lastName[0]}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{talent.personalInfo.countryOfOrigin}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span>{talent.education.fieldOfStudy}</span>
                    </div>

                    {talent.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Top Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {talent.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 text-xs rounded-full ${getSkillLevelColor(skill.level)}`}
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {talent.personalInfo.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {talent.personalInfo.bio}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTalent(talent);
                        navigate(`/profile/${talent._id}`);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <Eye className="h-4 w-4 mr-1 inline" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTalent(talent);
                        setShowInviteModal(true);
                      }}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Mail className="h-4 w-4 mr-1 inline" />
                      Invite
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && selectedTalent && (
        <InviteModal
          talent={selectedTalent}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedTalent(null);
          }}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
};

// Invite Modal Component
interface InviteModalProps {
  talent: Talent;
  onClose: () => void;
  onInvite: (talentId: string, inviteData: any) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ talent, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    type: 'scholarship',
    title: '',
    description: '',
    organization: '',
    position: '',
    location: 'remote',
    scheduledDate: '',
    duration: 60,
    providerNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(talent.userId._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Send Interview Invitation
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Invite {talent.userId.firstName} {talent.userId.lastName} for an interview
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="scholarship">Scholarship</option>
                <option value="internship">Internship</option>
                <option value="job">Job</option>
                <option value="mentorship">Mentorship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Interview title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Interview description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your organization"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard; 