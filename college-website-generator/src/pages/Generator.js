"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Eye,
  Save,
  Palette,
  Settings,
  Building,
  Users,
  BookOpen,
  Calendar,
  Award,
  MapPin,
  Mail,
  ChevronDown,
  ChevronUp,
  Layout,
  Image as ImageIcon,
  Newspaper,
  GraduationCap,
  Microscope,
  Globe,
  Map,
  Laptop,
  Search,
  FileText,
  Phone,
  Clock,
  Globe2,
  Video,
  BookMarked,
  Library,
  GraduationCap as GraduationCap2,
  Users as Users2,
  Building2,
  Computer,
  Presentation,
  TestTube,
  BookOpen as BookOpen2,
  Calendar as Calendar2,
  Newspaper as Newspaper2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import ApiService from '../services/api';
import axios from 'axios';

const API_URL = 'https://websitecreator-3.onrender.com/api';

// Remove jwt-decode import and add a utility function to decode JWT
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const Generator = () => {
  const [collegeData, setCollegeData] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    contact: {
      email: "",
      phone: "",
      website: "",
    },
    departments: [],
    facilities: [],
  })

  const [activeSection, setActiveSection] = useState("basic")
  const navigate = useNavigate()

  const [templates] = useState([
    {
      id: 1,
      name: "Modern Academic",
      description: "A modern and clean design suitable for educational institutions",
      features: ['Responsive Design', 'News Section', 'Events Calendar', 'Department Pages'],
      previewImage: 'https://wallpaperaccess.com/full/4723250.jpg',
      defaultColors: {
        primary: "#3B82F6",
        secondary: "#6B7280",
        background: "#FFFFFF",
        text: "#1F2937",
        accent: "#10B981"
      },
      imageSections: ["hero", "campus", "departments", "facilities"],
      sections: {
        news: {
          enabled: true,
          title: "Latest News",
          icon: Newspaper,
          items: []
        },
        events: {
          enabled: true,
          title: "Upcoming Events",
          icon: Calendar,
          items: []
        },
        departments: {
          enabled: true,
          title: "Academic Departments",
          icon: Users,
          items: []
        },
        facilities: {
          enabled: true,
          title: "Campus Facilities",
          icon: MapPin,
          items: []
        }
      }
    },
    {
      id: 2,
      name: "Classic College",
      description: "Traditional design with a professional look",
      features: ['Faculty Directory', 'Course Catalog', 'Student Portal', 'Research Showcase'],
      previewImage: 'https://wallpaperaccess.com/full/4723250.jpg',
      defaultColors: {
        primary: "#7C2D12",
        secondary: "#A3A3A3",
        background: "#FFFBEB",
        text: "#292524",
        accent: "#D97706"
      },
      imageSections: ["hero", "campus", "departments", "facilities"],
      sections: {
        faculty: {
          enabled: true,
          title: "Faculty Directory",
          icon: Users2,
          items: []
        },
        courses: {
          enabled: true,
          title: "Course Catalog",
          icon: BookOpen,
          items: []
        },
        research: {
          enabled: true,
          title: "Research Showcase",
          icon: Microscope,
          items: []
        },
        facilities: {
          enabled: true,
          title: "Campus Facilities",
          icon: MapPin,
          items: []
        }
      }
    },
    {
      id: 3,
      name: "Tech University",
      description: "Contemporary design with focus on technology and innovation",
      features: ['Interactive Campus Map', 'Virtual Tour', 'Online Admissions', 'Research Portal'],
      previewImage: 'https://wallpaperaccess.com/full/4723250.jpg',
      defaultColors: {
        primary: "#7C3AED",
        secondary: "#4B5563",
        background: "#F8FAFC",
        text: "#0F172A",
        accent: "#10B981"
      },
      imageSections: ["hero", "campus", "departments", "facilities"],
      sections: {
        virtualTour: {
          enabled: true,
          title: "Virtual Tour",
          icon: Globe2,
          items: []
        },
        admissions: {
          enabled: true,
          title: "Online Admissions",
          icon: FileText,
          items: []
        },
        research: {
          enabled: true,
          title: "Research Portal",
          icon: TestTube,
          items: []
        },
        facilities: {
          enabled: true,
          title: "Campus Facilities",
          icon: MapPin,
          items: []
        }
      }
    }
  ])

  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [colors, setColors] = useState({
    primary: "#3B82F6",
    secondary: "#6B7280",
    background: "#FFFFFF",
    text: "#1F2937",
    accent: "#10B981"
  })

  const [images, setImages] = useState({
    hero: "",
    campus: "",
    departments: {},
    facilities: {}
  })

  const [activeFeatures, setActiveFeatures] = useState({})

  const [newsItems, setNewsItems] = useState([])
  const [events, setEvents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [courses, setCourses] = useState([])
  const [research, setResearch] = useState([])
  const [virtualTour, setVirtualTour] = useState({
    title: "",
    description: "",
    videoUrl: "",
    images: []
  })
  const [admissions, setAdmissions] = useState({
    requirements: [],
    deadlines: [],
    applicationProcess: "",
    contactInfo: ""
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setCollegeData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setCollegeData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleArrayAdd = (arrayName) => {
    const newItem = getEmptyItem(arrayName)
    setCollegeData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem],
    }))
  }

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...collegeData[arrayName]]
    newArray[index] = { ...newArray[index], [field]: value }
    setCollegeData((prev) => ({
      ...prev,
      [arrayName]: newArray,
    }))
  }

  const handleArrayRemove = (arrayName, index) => {
    setCollegeData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }))
  }

  const getEmptyItem = (arrayName) => {
    const templates = {
      departments: { name: "", description: "", head: "" },
      facilities: { name: "", description: "" },
    }
    return templates[arrayName] || {}
  }

  const sections = [
    { id: "basic", title: "Basic Information", icon: Building },
    { id: "contact", title: "Contact Details", icon: Mail },
    { id: "departments", title: "Departments", icon: Users },
    { id: "facilities", title: "Facilities", icon: MapPin },
    { id: "news", title: "News & Updates", icon: Newspaper },
    { id: "events", title: "Events", icon: Calendar },
    { id: "faculty", title: "Faculty", icon: Users2 },
    { id: "courses", title: "Courses", icon: BookOpen },
    { id: "research", title: "Research", icon: Microscope },
    { id: "virtualTour", title: "Virtual Tour", icon: Globe2 },
    { id: "admissions", title: "Admissions", icon: FileText }
  ]

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setColors(template.defaultColors)
  }

  const handleColorChange = (colorType, value) => {
    setColors(prev => ({
      ...prev,
      [colorType]: value
    }))
  }

  const handleImageUpload = (section, index = null) => (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (index !== null) {
          setImages(prev => ({
            ...prev,
            [section]: {
              ...prev[section],
              [index]: reader.result
            }
          }))
        } else {
          setImages(prev => ({
            ...prev,
            [section]: reader.result
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFeatureToggle = (templateId, feature) => {
    setActiveFeatures(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [feature]: !prev[templateId]?.[feature]
      }
    }))
  }

  const handleNewsAdd = () => {
    setNewsItems([...newsItems, {
      title: "",
      content: "",
      date: "",
      image: ""
    }])
  }

  const handleNewsChange = (index, field, value) => {
    const newItems = [...newsItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setNewsItems(newItems)
  }

  const handleNewsRemove = (index) => {
    setNewsItems(newsItems.filter((_, i) => i !== index))
  }

  const handleEventAdd = () => {
    setEvents([...events, {
      title: "",
      description: "",
      date: "",
      location: "",
      image: ""
    }])
  }

  const handleEventChange = (index, field, value) => {
    const newEvents = [...events]
    newEvents[index] = { ...newEvents[index], [field]: value }
    setEvents(newEvents)
  }

  const handleEventRemove = (index) => {
    setEvents(events.filter((_, i) => i !== index))
  }

  const handleFacultyAdd = () => {
    setFaculty([...faculty, {
      name: "",
      position: "",
      department: "",
      bio: "",
      image: "",
      email: "",
      phone: ""
    }])
  }

  const handleFacultyChange = (index, field, value) => {
    const newFaculty = [...faculty]
    newFaculty[index] = { ...newFaculty[index], [field]: value }
    setFaculty(newFaculty)
  }

  const handleFacultyRemove = (index) => {
    setFaculty(faculty.filter((_, i) => i !== index))
  }

  const handleCourseAdd = () => {
    setCourses([...courses, {
      name: "",
      code: "",
      description: "",
      credits: "",
      duration: "",
      prerequisites: "",
      department: "",
      image: ""
    }])
  }

  const handleCourseChange = (index, field, value) => {
    const newCourses = [...courses]
    newCourses[index] = { ...newCourses[index], [field]: value }
    setCourses(newCourses)
  }

  const handleCourseRemove = (index) => {
    setCourses(courses.filter((_, i) => i !== index))
  }

  const handleResearchAdd = () => {
    setResearch([...research, {
      title: "",
      description: "",
      department: "",
      researchers: "",
      publications: "",
      image: ""
    }])
  }

  const handleResearchChange = (index, field, value) => {
    const newResearch = [...research]
    newResearch[index] = { ...newResearch[index], [field]: value }
    setResearch(newResearch)
  }

  const handleResearchRemove = (index) => {
    setResearch(research.filter((_, i) => i !== index))
  }

  const handleVirtualTourChange = (field, value) => {
    setVirtualTour(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVirtualTourImageAdd = () => {
    setVirtualTour(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }))
  }

  const handleVirtualTourImageChange = (index, value) => {
    const newImages = [...virtualTour.images]
    newImages[index] = value
    setVirtualTour(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const handleVirtualTourImageRemove = (index) => {
    setVirtualTour(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleAdmissionsRequirementAdd = () => {
    setAdmissions(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }))
  }

  const handleAdmissionsRequirementChange = (index, value) => {
    const newRequirements = [...admissions.requirements]
    newRequirements[index] = value
    setAdmissions(prev => ({
      ...prev,
      requirements: newRequirements
    }))
  }

  const handleAdmissionsRequirementRemove = (index) => {
    setAdmissions(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const handleAdmissionsDeadlineAdd = () => {
    setAdmissions(prev => ({
      ...prev,
      deadlines: [...prev.deadlines, { title: "", date: "" }]
    }))
  }

  const handleAdmissionsDeadlineChange = (index, field, value) => {
    const newDeadlines = [...admissions.deadlines]
    newDeadlines[index] = { ...newDeadlines[index], [field]: value }
    setAdmissions(prev => ({
      ...prev,
      deadlines: newDeadlines
    }))
  }

  const handleAdmissionsDeadlineRemove = (index) => {
    setAdmissions(prev => ({
      ...prev,
      deadlines: prev.deadlines.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!collegeData.name) {
        alert('Please provide a college name');
        return;
      }
      if (!collegeData.description) {
        alert('Please provide a description');
        return;
      }
      if (!collegeData.contact?.email) {
        alert('Please provide a contact email');
        return;
      }
      if (!collegeData.contact?.phone) {
        alert('Please provide a contact phone number');
        return;
      }
      if (!collegeData.contact?.website) {
        alert('Please provide a website URL');
        return;
      }

      // Format location object
      const location = {
        street: collegeData.address?.street || '',
        city: collegeData.address?.city || '',
        state: collegeData.address?.state || '',
        zipCode: collegeData.address?.zipCode || ''
      };

      // Get user ID from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData.id;

      // Prepare the college data
      const dataToSave = {
        collegeName: collegeData.name,
        description: collegeData.description,
        location: location,
        establishedYear: collegeData.establishedYear || new Date().getFullYear(),
        contact: {
          email: collegeData.contact.email,
          phone: collegeData.contact.phone,
          website: collegeData.contact.website
        },
        departments: collegeData.departments || [],
        facilities: collegeData.facilities || [],
        news: newsItems || [],
        events: events || [],
        faculty: faculty || [],
        courses: courses || [],
        research: research || [],
        virtualTour: virtualTour || {},
        admissions: admissions || {},
        template: selectedTemplate || null,
        colors: colors || {},
        images: images || {},
        createdBy: userId // The backend will convert this to ObjectId
      };

      // Log the data being sent for debugging
      console.log('Saving college data:', dataToSave);

      // Save to database
      const response = await axios.post(
        `${API_URL}/colleges`,
        dataToSave,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Navigate to preview page with the new college ID
      navigate(`/preview/${response.data._id}`);
    } catch (error) {
      console.error('Error saving college:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to save college. Please try again.');
      }
    }
  };

  const handlePreview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user ID from token using our utility function
      const decoded = decodeToken(token);
      const userId = decoded?.userId;

      if (!userId) {
        alert('Invalid token. Please login again.');
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!collegeData.name || !collegeData.description) {
        alert('Please fill in the college name and description');
        return;
      }

      // Format location data
      const location = {
        street: collegeData.location?.street || '',
        city: collegeData.location?.city || '',
        state: collegeData.location?.state || '',
        zipCode: collegeData.location?.zipCode || ''
      };

      // Prepare the college data
      const dataToSave = {
        collegeName: collegeData.name,
        description: collegeData.description,
        location: location,
        establishedYear: collegeData.establishedYear || new Date().getFullYear(),
        contact: {
          email: collegeData.contact?.email || '',
          phone: collegeData.contact?.phone || '',
          website: collegeData.contact?.website || ''
        },
        departments: collegeData.departments || [],
        facilities: collegeData.facilities || [],
        news: newsItems || [],
        events: events || [],
        faculty: faculty || [],
        courses: courses || [],
        research: research || [],
        virtualTour: virtualTour || {},
        admissions: admissions || {},
        template: selectedTemplate || null,
        colors: colors || {},
        images: images || {},
        createdBy: userId
      };

      // Save to database
      const response = await axios.post(
        `${API_URL}/colleges`,
        dataToSave,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Navigate to preview page with the new college ID
      navigate(`/preview/${response.data._id}`);
    } catch (error) {
      console.error('Error saving college:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to save college. Please try again.');
      }
    }
  };

  const renderImageUpload = (section, index = null) => {
    const currentImage = index !== null ? images[section]?.[index] : images[section]
    
    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {section.charAt(0).toUpperCase() + section.slice(1)} Image
        </label>
        <div className="flex items-center space-x-4">
          {currentImage ? (
            <div className="relative w-32 h-32">
              <img
                src={currentImage}
                alt={`${section} preview`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  if (index !== null) {
                    setImages(prev => ({
                      ...prev,
                      [section]: {
                        ...prev[section],
                        [index]: ""
                      }
                    }))
                  } else {
                    setImages(prev => ({
                      ...prev,
                      [section]: ""
                    }))
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload(section, index)}
              className="hidden"
              id={`image-upload-${section}-${index || ''}`}
            />
            <label
              htmlFor={`image-upload-${section}-${index || ''}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Upload Image
            </label>
          </div>
        </div>
      </div>
    )
  }

  const renderFeatureSection = (template) => {
    if (!template) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Template Features</h3>
          </div>
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a template to view available features</p>
          </div>
        </div>
      )
    }

    const features = template.sections
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Template Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(features).map(([key, section]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 ${
                activeFeatures[template.id]?.[key]
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center space-x-3">
                <section.icon className="w-6 h-6 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{section.title}</h4>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
                <button
                  onClick={() => handleFeatureToggle(template.id, key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFeatures[template.id]?.[key]
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {activeFeatures[template.id]?.[key] ? "Enabled" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null

    const style = {
      "--primary-color": colors.primary,
      "--secondary-color": colors.secondary,
      "--background-color": colors.background,
      "--text-color": colors.text,
      "--accent-color": colors.accent,
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={style}>
        <div className="relative">
          {images.hero ? (
            <div className="h-96 relative">
              <img
                src={images.hero}
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <h1 className="text-4xl font-bold mb-4">{collegeData.name || "Your College Name"}</h1>
                  <p className="text-xl opacity-90">{collegeData.description || "Your college description"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8" style={{ backgroundColor: colors.primary, color: "#FFFFFF" }}>
              <h1 className="text-4xl font-bold mb-4">{collegeData.name || "Your College Name"}</h1>
              <p className="text-xl opacity-90">{collegeData.description || "Your college description"}</p>
            </div>
          )}
        </div>

        {images.campus && (
          <div className="p-8" style={{ backgroundColor: colors.background }}>
            <div className="max-w-4xl mx-auto">
              <img
                src={images.campus}
                alt="Campus"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}

        <div className="p-8" style={{ backgroundColor: colors.background }}>
          {/* News Section */}
          {activeFeatures[selectedTemplate.id]?.news && newsItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <Newspaper className="w-6 h-6 inline-block mr-2" />
                Latest News
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {newsItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {images.news?.[index] && (
                      <img
                        src={images.news[index]}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{item.date}</p>
                      <p style={{ color: colors.secondary }}>{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {activeFeatures[selectedTemplate.id]?.events && events.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <Calendar className="w-6 h-6 inline-block mr-2" />
                Upcoming Events
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {images.events?.[index] && (
                      <img
                        src={images.events[index]}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(event.date).toLocaleDateString()} at {event.location}
                      </p>
                      <p style={{ color: colors.secondary }}>{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Section */}
          {activeFeatures[selectedTemplate.id]?.faculty && faculty.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <Users2 className="w-6 h-6 inline-block mr-2" />
                Faculty Directory
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {faculty.map((member, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {images.faculty?.[index] && (
                      <img
                        src={images.faculty[index]}
                        alt={member.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1" style={{ color: colors.primary }}>
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{member.position}</p>
                      <p className="text-sm mb-2" style={{ color: colors.secondary }}>
                        {member.department}
                      </p>
                      <p className="text-sm" style={{ color: colors.secondary }}>
                        {member.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Section */}
          {activeFeatures[selectedTemplate.id]?.courses && courses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <BookOpen className="w-6 h-6 inline-block mr-2" />
                Course Catalog
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {courses.map((course, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {images.courses?.[index] && (
                      <img
                        src={images.courses[index]}
                        alt={course.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1" style={{ color: colors.primary }}>
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">Code: {course.code}</p>
                      <p className="text-sm mb-2" style={{ color: colors.secondary }}>
                        {course.description}
                      </p>
                      <div className="text-sm text-gray-600">
                        <p>Credits: {course.credits}</p>
                        <p>Duration: {course.duration}</p>
                        <p>Department: {course.department}</p>
                        {course.prerequisites && (
                          <p>Prerequisites: {course.prerequisites}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Section */}
          {activeFeatures[selectedTemplate.id]?.research && research.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <Microscope className="w-6 h-6 inline-block mr-2" />
                Research Projects
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {research.map((project, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {images.research?.[index] && (
                      <img
                        src={images.research[index]}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{project.department}</p>
                      <p className="mb-4" style={{ color: colors.secondary }}>
                        {project.description}
                      </p>
                      <div className="text-sm">
                        <p className="font-medium mb-1">Researchers:</p>
                        <p className="text-gray-600 mb-3">{project.researchers}</p>
                        <p className="font-medium mb-1">Publications:</p>
                        <p className="text-gray-600">{project.publications}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Virtual Tour Section */}
          {activeFeatures[selectedTemplate.id]?.virtualTour && virtualTour.title && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <Globe2 className="w-6 h-6 inline-block mr-2" />
                Virtual Tour
              </h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {virtualTour.videoUrl && (
                  <div className="aspect-video">
                    <iframe
                      src={virtualTour.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
                    {virtualTour.title}
                  </h3>
                  <p className="mb-4" style={{ color: colors.secondary }}>
                    {virtualTour.description}
                  </p>
                  {virtualTour.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {virtualTour.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Tour image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admissions Section */}
          {activeFeatures[selectedTemplate.id]?.admissions && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <FileText className="w-6 h-6 inline-block mr-2" />
                Admissions
              </h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  {admissions.requirements.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                        Requirements
                      </h3>
                      <ul className="list-disc list-inside space-y-2">
                        {admissions.requirements.map((req, index) => (
                          <li key={index} style={{ color: colors.secondary }}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {admissions.deadlines.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                        Application Deadlines
                      </h3>
                      <div className="space-y-2">
                        {admissions.deadlines.map((deadline, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span style={{ color: colors.secondary }}>{deadline.title}</span>
                            <span className="text-gray-600">{new Date(deadline.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {admissions.applicationProcess && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                        Application Process
                      </h3>
                      <p style={{ color: colors.secondary }}>{admissions.applicationProcess}</p>
                    </div>
                  )}

                  {admissions.contactInfo && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                        Contact Information
                      </h3>
                      <p style={{ color: colors.secondary }}>{admissions.contactInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Departments Section */}
          {collegeData.departments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <Users className="w-6 h-6 inline-block mr-2" />
                Academic Excellence
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {collegeData.departments.map((dept, index) => (
                  <div key={index} className="p-6 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
                    {images.departments?.[index] && (
                      <img
                        src={images.departments[index]}
                        alt={dept.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>{dept.name}</h3>
                    <p style={{ color: colors.secondary }}>{dept.description}</p>
                    {dept.head && <p className="text-sm mt-2" style={{ color: colors.secondary }}>Head: {dept.head}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities Section */}
          {collegeData.facilities.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                <MapPin className="w-6 h-6 inline-block mr-2" />
                Campus Facilities
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {collegeData.facilities.map((facility, index) => (
                  <div key={index} className="p-6 rounded-lg" style={{ backgroundColor: `${colors.accent}10` }}>
                    {images.facilities?.[index] && (
                      <img
                        src={images.facilities[index]}
                        alt={facility.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold mb-2" style={{ color: colors.accent }}>{facility.name}</h3>
                    <p style={{ color: colors.secondary }}>{facility.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderFormSection = (sectionId) => {
    switch (sectionId) {
      case "basic":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">College Name *</label>
              <input
                type="text"
                name="name"
                value={collegeData.name}
                onChange={handleInputChange}
                placeholder="Enter your college name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={collegeData.description}
                onChange={handleInputChange}
                placeholder="Describe your college"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={collegeData.address.street}
                  onChange={handleInputChange}
                  placeholder="123 College Street"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={collegeData.address.city}
                  onChange={handleInputChange}
                  placeholder="City name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={collegeData.address.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={collegeData.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {renderImageUpload("hero")}
            {renderImageUpload("campus")}
          </div>
        )

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="contact.email"
                value={collegeData.contact.email}
                onChange={handleInputChange}
                placeholder="info@yourcollege.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="contact.phone"
                value={collegeData.contact.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <input
                type="url"
                name="contact.website"
                value={collegeData.contact.website}
                onChange={handleInputChange}
                placeholder="https://www.yourcollege.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )

      case "departments":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Academic Departments</h3>
              <button
                onClick={() => handleArrayAdd("departments")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </button>
            </div>

            {collegeData.departments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No departments added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {collegeData.departments.map((dept, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Department {index + 1}</h4>
                      <button
                        onClick={() => handleArrayRemove("departments", index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {renderImageUpload("departments", index)}
                      <input
                        type="text"
                        placeholder="Department Name"
                        value={dept.name}
                        onChange={(e) => handleArrayChange("departments", index, "name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="Department Description"
                        value={dept.description}
                        onChange={(e) => handleArrayChange("departments", index, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Department Head"
                        value={dept.head}
                        onChange={(e) => handleArrayChange("departments", index, "head", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "facilities":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Campus Facilities</h3>
              <button
                onClick={() => handleArrayAdd("facilities")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Facility
              </button>
            </div>

            {collegeData.facilities.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No facilities added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {collegeData.facilities.map((facility, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Facility {index + 1}</h4>
                      <button
                        onClick={() => handleArrayRemove("facilities", index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {renderImageUpload("facilities", index)}
                      <input
                        type="text"
                        placeholder="Facility Name"
                        value={facility.name}
                        onChange={(e) => handleArrayChange("facilities", index, "name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="Facility Description"
                        value={facility.description}
                        onChange={(e) => handleArrayChange("facilities", index, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "news":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">News & Updates</h3>
              <button
                onClick={handleNewsAdd}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add News
              </button>
            </div>

            {newsItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No news items added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {newsItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">News Item {index + 1}</h4>
                      <button
                        onClick={() => handleNewsRemove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {renderImageUpload("news", index)}
                      <input
                        type="text"
                        placeholder="News Title"
                        value={item.title}
                        onChange={(e) => handleNewsChange(index, "title", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="News Content"
                        value={item.content}
                        onChange={(e) => handleNewsChange(index, "content", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => handleNewsChange(index, "date", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "events":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Events</h3>
              <button
                onClick={handleEventAdd}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No events added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Event {index + 1}</h4>
                      <button
                        onClick={() => handleEventRemove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {renderImageUpload("events", index)}
                      <input
                        type="text"
                        placeholder="Event Title"
                        value={event.title}
                        onChange={(e) => handleEventChange(index, "title", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="Event Description"
                        value={event.description}
                        onChange={(e) => handleEventChange(index, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-4">
                      <input
                        type="datetime-local"
                        value={event.date}
                          onChange={(e) => handleEventChange(index, "date", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                          placeholder="Event Location"
                        value={event.location}
                          onChange={(e) => handleEventChange(index, "location", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "faculty":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Faculty Members</h3>
              <button
                onClick={handleFacultyAdd}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Faculty
              </button>
            </div>

            {faculty.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No faculty members added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faculty.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Faculty Member {index + 1}</h4>
                      <button
                        onClick={() => handleFacultyRemove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {renderImageUpload("faculty", index)}
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => handleFacultyChange(index, "name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={member.position}
                        onChange={(e) => handleFacultyChange(index, "position", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        value={member.department}
                        onChange={(e) => handleFacultyChange(index, "department", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="Biography"
                        value={member.bio}
                        onChange={(e) => handleFacultyChange(index, "bio", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-4">
                      <input
                        type="email"
                          placeholder="Email Address"
                        value={member.email}
                          onChange={(e) => handleFacultyChange(index, "email", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                          placeholder="Phone Number"
                        value={member.phone}
                          onChange={(e) => handleFacultyChange(index, "phone", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "courses":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Courses</h3>
              <button
                onClick={handleCourseAdd}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Course {index + 1}</h4>
                      <button
                        onClick={() => handleCourseRemove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {renderImageUpload("courses", index)}
                      <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                          placeholder="Course Name"
                        value={course.name}
                          onChange={(e) => handleCourseChange(index, "name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                          placeholder="Course Code"
                        value={course.code}
                          onChange={(e) => handleCourseChange(index, "code", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      </div>
                      <textarea
                        placeholder="Course Description"
                        value={course.description}
                        onChange={(e) => handleCourseChange(index, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-4">
                      <input
                          type="text"
                        placeholder="Credits"
                        value={course.credits}
                          onChange={(e) => handleCourseChange(index, "credits", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={course.duration}
                          onChange={(e) => handleCourseChange(index, "duration", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      </div>
                      <input
                        type="text"
                        placeholder="Prerequisites"
                        value={course.prerequisites}
                        onChange={(e) => handleCourseChange(index, "prerequisites", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        value={course.department}
                        onChange={(e) => handleCourseChange(index, "department", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "research":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Research Projects</h3>
              <button
                onClick={handleResearchAdd}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Research
              </button>
            </div>

            {research.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Microscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No research projects added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {research.map((project, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Research Project {index + 1}</h4>
                      <button
                        onClick={() => handleResearchRemove(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {renderImageUpload("research", index)}
                      <input
                        type="text"
                        placeholder="Research Title"
                        value={project.title}
                        onChange={(e) => handleResearchChange(index, "title", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="Research Description"
                        value={project.description}
                        onChange={(e) => handleResearchChange(index, "description", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Department/Area"
                        value={project.department}
                        onChange={(e) => handleResearchChange(index, "department", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="Researchers Involved"
                        value={project.researchers}
                        onChange={(e) => handleResearchChange(index, "researchers", e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder="Publications"
                        value={project.publications}
                        onChange={(e) => handleResearchChange(index, "publications", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "virtualTour":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Virtual Tour</h3>
              <div className="space-y-4">
              <input
                type="text"
                  placeholder="Tour Title"
                value={virtualTour.title}
                  onChange={(e) => handleVirtualTourChange("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                  placeholder="Tour Description"
                value={virtualTour.description}
                  onChange={(e) => handleVirtualTourChange("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="url"
                  placeholder="Video URL"
                value={virtualTour.videoUrl}
                  onChange={(e) => handleVirtualTourChange("videoUrl", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Tour Images</h4>
                <button
                  onClick={handleVirtualTourImageAdd}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </button>
              </div>

              <div className="space-y-4">
                {virtualTour.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    {renderImageUpload("virtualTour", index)}
                    <button
                      onClick={() => handleVirtualTourImageRemove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "admissions":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admissions</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Requirements</h4>
                    <button
                      onClick={handleAdmissionsRequirementAdd}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Requirement
                    </button>
                  </div>

                  <div className="space-y-4">
                {admissions.requirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                          placeholder="Requirement"
                      value={req}
                          onChange={(e) => handleAdmissionsRequirementChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                          onClick={() => handleAdmissionsRequirementRemove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Application Deadlines</h4>
                <button
                      onClick={handleAdmissionsDeadlineAdd}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                      Add Deadline
                </button>
            </div>

                  <div className="space-y-4">
                {admissions.deadlines.map((deadline, index) => (
                      <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                          placeholder="Deadline Title"
                      value={deadline.title}
                          onChange={(e) => handleAdmissionsDeadlineChange(index, "title", e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={deadline.date}
                          onChange={(e) => handleAdmissionsDeadlineChange(index, "date", e.target.value)}
                          className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                          onClick={() => handleAdmissionsDeadlineRemove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
                  <h4 className="font-medium text-gray-900 mb-4">Application Process</h4>
              <textarea
                    placeholder="Describe the application process"
                value={admissions.applicationProcess}
                    onChange={(e) => setAdmissions(prev => ({ ...prev, applicationProcess: e.target.value }))}
                    rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
                  <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
              <textarea
                    placeholder="Admissions contact information"
                value={admissions.contactInfo}
                    onChange={(e) => setAdmissions(prev => ({ ...prev, contactInfo: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Add function to load saved data
  const loadSavedData = async () => {
    try {
      const savedData = await ApiService.getWebsiteData();
      if (savedData) {
        setCollegeData(savedData.collegeData || collegeData);
        setNewsItems(savedData.newsItems || []);
        setEvents(savedData.events || []);
        setFaculty(savedData.faculty || []);
        setCourses(savedData.courses || []);
        setResearch(savedData.research || []);
        setVirtualTour(savedData.virtualTour || virtualTour);
        setAdmissions(savedData.admissions || admissions);
        setSelectedTemplate(savedData.template || null);
        setColors(savedData.colors || colors);
        setImages(savedData.images || images);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading saved data. Please try again.');
    }
  };

  const handleSectionCustomization = (section, data) => {
    switch (section) {
      case 'departments':
        setCollegeData(prev => ({
          ...prev,
          departments: [...prev.departments, {
            name: data.name,
            description: data.description,
            head: data.head,
            courses: data.courses || [],
            faculty: data.faculty || [],
            facilities: data.facilities || []
          }]
        }));
        break;
      case 'facilities':
        setCollegeData(prev => ({
          ...prev,
          facilities: [...prev.facilities, {
            name: data.name,
            description: data.description,
            location: data.location,
            images: data.images || [],
            openingHours: data.openingHours,
            contact: data.contact
          }]
        }));
        break;
      case 'news':
        setNewsItems(prev => [...prev, {
          title: data.title,
          content: data.content,
          date: data.date,
          image: data.image,
          category: data.category,
          author: data.author
        }]);
        break;
      case 'events':
        setEvents(prev => [...prev, {
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          registration: data.registration,
          image: data.image
        }]);
        break;
      case 'faculty':
        setFaculty(prev => [...prev, {
          name: data.name,
          position: data.position,
          department: data.department,
          bio: data.bio,
          image: data.image,
          contact: data.contact,
          research: data.research || []
        }]);
        break;
      case 'courses':
        setCourses(prev => [...prev, {
          name: data.name,
          code: data.code,
          description: data.description,
          credits: data.credits,
          prerequisites: data.prerequisites,
          department: data.department,
          faculty: data.faculty
        }]);
        break;
      case 'research':
        setResearch(prev => [...prev, {
          title: data.title,
          description: data.description,
          faculty: data.faculty,
          funding: data.funding,
          publications: data.publications || [],
          image: data.image
        }]);
        break;
      case 'virtualTour':
        setVirtualTour(prev => ({
          ...prev,
          sections: [...(prev.sections || []), {
            title: data.title,
            description: data.description,
            images: data.images || [],
            video: data.video,
            location: data.location
          }]
        }));
        break;
      case 'admissions':
        setAdmissions(prev => ({
          ...prev,
          requirements: [...(prev.requirements || []), {
            program: data.program,
            requirements: data.requirements,
            deadlines: data.deadlines,
            documents: data.documents
          }]
        }));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Template Selection */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Templates</h2>
                <div className="space-y-3">
            {templates.map((template) => (
                    <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                      className={`p-4 rounded-lg border-2 cursor-pointer ${
                  selectedTemplate?.id === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="aspect-video mb-3 rounded-lg overflow-hidden">
                        <img
                          src={template.previewImage}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {feature}
                          </span>
            ))}
          </div>
        </div>
              ))}
            </div>
          </div>
            </div>

            {/* Color Customization */}
            {selectedTemplate && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Colors
                </h2>
                <div className="space-y-4">
                  {Object.entries(colors).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <div className="flex items-center space-x-3">
                <input
                  type="color"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
              </div>
            ))}
          </div>
        </div>
            )}

            {/* Sections Navigation */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
        <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{section.title}</span>
        </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {(() => {
                      const currentSection = sections.find((s) => s.id === activeSection)
                      const Icon = currentSection?.icon || Building
                      return <Icon className="w-6 h-6 mr-3 text-blue-600" />
                    })()}
                    <h2 className="text-xl font-semibold text-gray-900">
                      {sections.find((s) => s.id === activeSection)?.title || "Section"}
                    </h2>
                  </div>
                  {selectedTemplate && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Website
                      </button>
                      <button
                        onClick={handlePreview}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {selectedTemplate ? (
                  <>
                    {renderFeatureSection(selectedTemplate)}
                    {renderFormSection(activeSection)}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a template to start customizing your website</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Website Preview - {selectedTemplate.name}</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {renderTemplatePreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Generator
