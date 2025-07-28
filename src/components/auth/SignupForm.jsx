import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Users, GraduationCap, Check, X } from 'lucide-react';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'refugee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [modalCheckboxChecked, setModalCheckboxChecked] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      setError('You must agree to the Privacy Policy and Terms of Use');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...signupData } = formData;
    try {
      const result = await signup(signupData);
      if (result.success && result.redirectTo) {
        navigate(result.redirectTo);
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
    setLoading(false);
  };

  const roleOptions = [
    {
      value: 'refugee',
      label: 'Refugee Student',
      description: 'I am a refugee student looking for educational opportunities',
      icon: GraduationCap
    },
    {
      value: 'provider',
      label: 'Provider',
      description: 'I represent an organization offering opportunities',
      icon: Users
    },
    {
      value: 'admin',
      label: 'Administrator',
      description: 'I am a platform administrator',
      icon: User
    }
  ];

  const PrivacyPolicyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1"></div>
            <h2 className="text-xl font-bold text-gray-900 text-center flex-1">REFUTURE Privacy Policy & User Agreement</h2>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">Last Updated: 27 July 2025</p>
          <p className="text-sm text-gray-600 text-center">Platform Name: REFUTURE – Empowering Refugee Talent</p>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 1. Introduction
            </h3>
            <p className="text-gray-700 mb-3">
              Welcome to REFUTURE, a secure digital platform designed to help refugees and displaced individuals connect with education, employment, and sponsorship opportunities. Your privacy and data security are our top priorities.
            </p>
            <p className="text-gray-700 mb-3">This agreement outlines:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>Your rights as a user</li>
              <li>How your data is used and protected</li>
              <li>The consent we require before collecting or sharing any information</li>
              <li>Our legal responsibilities, and what you agree to by using the platform</li>
            </ul>
            <p className="text-gray-700">
              By clicking "Agree and Create Account", you confirm that you understand and accept this agreement.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 2. User Rights
            </h3>
            <p className="text-gray-700 mb-3">As a user of REFUTURE, you have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>Access your data at any time</li>
              <li>Edit or update incorrect or outdated information</li>
              <li>Withdraw consent to data sharing at any time</li>
              <li>Request account deletion, including permanent erasure of your data</li>
              <li>Be informed when your data is accessed, used, or shared by third parties</li>
            </ul>
            <p className="text-gray-700">We are committed to transparency and user control at every step.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 3. Data Collection & Usage
            </h3>
            <p className="text-gray-700 mb-3">We collect only necessary information during account registration:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>Name, age, gender</li>
              <li>Country of origin and current camp/location</li>
              <li>Education level, skills, and personal achievements</li>
              <li>Optional: photo, CV, story, or video</li>
              <li>Contact details (if available)</li>
            </ul>
            
            <p className="text-gray-700 mb-3">Purpose of data use:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>To connect you with suitable opportunities</li>
              <li>To allow sponsors, institutions, and employers to view your profile</li>
              <li>For internal improvements and reporting (anonymized)</li>
            </ul>
            <p className="text-gray-700">We do not sell your data or share it with unauthorized third parties.</p>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h5 className="font-medium text-gray-900 mb-2">For Providers/Organizations:</h5>
              <p className="text-gray-700 mb-2">As a provider, we also collect:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Organization name and details</li>
                <li>Contact person information</li>
                <li>Opportunity details and requirements</li>
                <li>Verification documents for organization legitimacy</li>
                <li>Terms and conditions for opportunities offered</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 4. Consent Requirements
            </h3>
            <p className="text-gray-700 mb-3">Before collecting or sharing your data:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>We ask for your consent during account creation</li>
              <li>You will have the option to opt in or out of public visibility and sharing with sponsors</li>
              <li>You may revoke your consent at any time in your account settings</li>
            </ul>
            <p className="text-gray-700">We comply with consent standards set by international data protection frameworks (e.g., GDPR principles).</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 5. Data Protection & Security
            </h3>
            <p className="text-gray-700 mb-3">To protect your sensitive information, we use:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>Secure database storage with limited administrative access</li>
              <li>Access controls, secure login, and system firewalls</li>
              <li>Regular security audits and monitoring</li>
            </ul>
            <p className="text-gray-700">You can be confident that your identity, background, and personal story are stored and shared responsibly.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 6. Copyright & User Content
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>You own your profile data and any content you upload (e.g., CV, photo)</li>
              <li>By using REFUTURE, you give us a non-exclusive, limited license to display your profile for the purpose of opportunity matching</li>
              <li>You may remove or modify your content at any time</li>
              <li>We do not claim ownership of your story—you remain its rightful author</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 7. Limitation of Liability
            </h3>
            <p className="text-gray-700 mb-3">REFUTURE:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>Provides a platform for opportunity discovery but does not guarantee placement</li>
              <li>Is not responsible for the actions or decisions of third-party sponsors or organizations</li>
              <li>Is not liable for any loss resulting from user misuse or shared login credentials</li>
            </ul>
            <p className="text-gray-700">That said, we vet our partners and sponsors and respond swiftly to misuse or fraud reports.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔹</span> 8. Changes to the Policy
            </h3>
            <p className="text-gray-700 mb-3">We may update this agreement occasionally. If we do:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-3">
              <li>We will notify you via email or app notification</li>
              <li>You will be asked to review and accept changes before continuing to use the platform</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Final Consent Statement
            </h3>
            <p className="text-gray-700 mb-4">By clicking "Agree and Create Account", you acknowledge that:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>You understand and accept our Privacy Policy and Terms of Use</li>
              <li>You consent to the collection and secure use of your data for opportunity matching</li>
              <li>You understand your rights and responsibilities as a user</li>
            </ul>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="close-modal-checkbox"
                  name="close-modal-checkbox"
                  type="checkbox"
                  checked={modalCheckboxChecked}
                  onChange={(e) => setModalCheckboxChecked(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="close-modal-checkbox" className="text-gray-700">
                  I have read and understood the Privacy Policy and User Agreement
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                if (modalCheckboxChecked) {
                  setShowPrivacyModal(false);
                  setModalCheckboxChecked(false);
                }
              }}
              disabled={!modalCheckboxChecked}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Refuture and start your journey
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-8">
          <form className="space-y-2" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {roleOptions.find(opt => opt.value === formData.role)?.description}
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agree-terms" className="text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-blue-600 hover:text-blue-500 underline"
                    >
                      Privacy Policy and Terms of Use
                    </button>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Agree and Create Account'}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      {showPrivacyModal && <PrivacyPolicyModal />}
    </div>
  );
};

export default SignupForm; 