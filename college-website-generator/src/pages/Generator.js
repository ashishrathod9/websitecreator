"use client"

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WebsiteGenerator from '../components/WebsiteGenerator';
import ApiService from '../services/ApiService';
import {
  Newspaper,
  Calendar,
  Users,
  MapPin,
  Users2,
  BookOpen,
  Microscope,
  Globe2,
  FileText,
  TestTube,
  Building,
  Mail,
  Trash2,
  ImageIcon,
  Layout,
  Plus,
  Palette,
  Save,
  Eye
} from 'lucide-react';

const API_URL = 'https://websitecreator-4.onrender.com/api';

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

  const handleVirtualTourImageRemove = (index) => {
    setVirtualTour(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }
