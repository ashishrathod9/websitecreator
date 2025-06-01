import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, CheckCircle, XCircle, ChevronLeft, ChevronRight, MapPin, Mail, Phone, Globe, Calendar } from 'lucide-react';

const API_URL = 'https://websitecreator-4.onrender.com/api';

const Preview = () => {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollege();
  }, [id, fetchCollege]);

  const fetchCollege = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCollege(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load college data');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      if (!college) {
        throw new Error('No college data to save');
      }

      // Save the current state of the college website
      await axios.put(
        `${API_URL}/colleges/${id}`,
        college,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000); // Clear success message after 3 seconds
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setError(error.response?.data?.message || 'Failed to save college website');
    } finally {
      setSaving(false);
    }
  };

  const nextImage = () => {
    if (college.images && college.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % college.images.length);
    }
  };

  const prevImage = () => {
    if (college.images && college.images.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + college.images.length) % college.images.length);
    }
  };

  const getColorClasses = () => {
    if (!college?.colors) return {
      primary: '#3B82F6',
      secondary: '#6B7280',
      background: '#FFFFFF',
      text: '#1F2937',
      accent: '#10B981'
    };

    return {
      primary: college.colors.primary || '#3B82F6',
      secondary: college.colors.secondary || '#6B7280',
      background: college.colors.background || '#FFFFFF',
      text: college.colors.text || '#1F2937',
      accent: college.colors.accent || '#10B981'
    };
  };

  const colors = getColorClasses();

  // Function to get all images from the college data
  const getAllImages = () => {
    if (!college?.images) return [];
    
    const images = [];
    
    // Add hero image if exists
    if (college.images.hero) {
      images.push(college.images.hero);
    }
    
    // Add campus image if exists
    if (college.images.campus) {
      images.push(college.images.campus);
    }
    
    // Add department images
    if (college.images.departments) {
      Object.values(college.images.departments).forEach(img => {
        if (img) images.push(img);
      });
    }
    
    // Add facility images
    if (college.images.facilities) {
      Object.values(college.images.facilities).forEach(img => {
        if (img) images.push(img);
      });
    }
    
    return images;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-xl">{error}</p>
          <button 
            onClick={fetchCollege} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">College not found</p>
          <button 
            onClick={() => navigate('/generator')} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New College
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header with Save Button */}
      <header style={{ backgroundColor: colors.primary, color: '#FFFFFF' }} className="p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">{college.collegeName}</h1>
              <p className="mt-2">{college.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              {saveStatus === 'success' && (
                <div className="flex items-center text-green-300 animate-fade-in">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Saved successfully!</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center text-red-300 animate-fade-in">
                  <XCircle className="w-5 h-5 mr-2" />
                  <span>Save failed</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                style={{ color: colors.primary }}
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save Website'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      {getAllImages().length > 0 && (
        <section className="relative bg-black">
          <div className="container mx-auto">
            <div className="relative h-[400px] overflow-hidden">
              <img
                src={getAllImages()[activeImageIndex]}
                alt={`${college.collegeName} campus`}
                className="w-full h-full object-cover transition-opacity duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                }}
              />
              {getAllImages().length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {getAllImages().map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {['overview', 'academics', 'campus', 'admissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  color: activeTab === tab ? colors.primary : undefined,
                  borderColor: activeTab === tab ? colors.primary : undefined
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contact Information with Icons */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" style={{ color: colors.primary }} />
                <span style={{ color: colors.text }}>{college.contact?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" style={{ color: colors.primary }} />
                <span style={{ color: colors.text }}>{college.contact?.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5" style={{ color: colors.primary }} />
                <span style={{ color: colors.text }}>{college.contact?.website}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                <span style={{ color: colors.text }}>
                  {`${college.location?.street}, ${college.location?.city}, ${college.location?.state} ${college.location?.zipCode}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments with Hover Effects */}
      {college.departments && college.departments.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Academic Departments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {college.departments.map((dept, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 border-t-4 border-${colors.primary}-500`}
                >
                  <h3 className="text-xl font-semibold mb-2">{dept.name}</h3>
                  <p className="text-gray-600">{dept.description}</p>
                  {dept.head && (
                    <p className={`mt-2 text-${colors.primary}-600`}>
                      <strong>Department Head:</strong> {dept.head}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News with Date Badges */}
      {college.news && college.news.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Latest News</h2>
            <div className="space-y-6">
              {college.news.map((item, index) => (
                <div
                  key={index}
                  className={`bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors duration-300 border-l-4 border-${colors.primary}-500`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    {item.date && (
                      <span className={`bg-${colors.primary}-100 text-${colors.primary}-800 px-3 py-1 rounded-full text-sm`}>
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events with Interactive Cards */}
      {college.events && college.events.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {college.events.map((event, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-${colors.primary}-500`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`bg-${colors.primary}-100 p-3 rounded-lg`}>
                      <Calendar className={`w-6 h-6 text-${colors.primary}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {event.date && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Facilities with Icons */}
      {college.facilities && college.facilities.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Campus Facilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {college.facilities.map((facility, index) => (
                <div
                  key={index}
                  className={`bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors duration-300 border-l-4 border-${colors.primary}-500`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`bg-${colors.primary}-100 p-2 rounded-lg`}>
                      <MapPin className={`w-5 h-5 text-${colors.primary}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold">{facility.name}</h3>
                  </div>
                  <p className="text-gray-600">{facility.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer with Social Links */}
      <footer className={`bg-${colors.primary}-800 text-white py-8`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{college.collegeName}</h3>
              <p className="text-gray-400">{college.description}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 hover:text-white transition-colors">About Us</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors">Admissions</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors">Academics</span></li>
                <li><span className="text-gray-400 hover:text-white transition-colors">Contact</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{college.location?.street}, {college.location?.city}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{college.contact?.phone}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{college.contact?.email}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; {new Date().getFullYear()} {college.collegeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Preview; 