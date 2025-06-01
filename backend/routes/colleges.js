const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Generate website
router.post('/generate', async (req, res) => {
  try {
    const collegeData = req.body;
    
    // Create a new college document
    const college = new College(collegeData);
    await college.save();

    // Generate HTML template
    const html = generateWebsiteTemplate(college);
    
    res.json({ 
      html,
      collegeId: college._id 
    });
  } catch (error) {
    console.error('Error generating website:', error);
    res.status(500).json({ message: 'Error generating website' });
  }
});

// Get all colleges for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const colleges = await College.find({ createdBy: req.user._id });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single college
router.get('/:id', auth, async (req, res) => {
  try {
    const college = await College.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });
    
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create college
router.post('/', auth, async (req, res) => {
  try {
    const college = new College({
      ...req.body,
      createdBy: req.user._id
    });

    await college.save();
    res.status(201).json(college);
  } catch (error) {
    console.error('Error creating college:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update college
router.patch('/:id', auth, async (req, res) => {
  try {
    const college = await College.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });
    
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    Object.keys(req.body).forEach(key => {
      college[key] = req.body[key];
    });

    const updatedCollege = await college.save();
    res.json(updatedCollege);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete college
router.delete('/:id', auth, async (req, res) => {
  try {
    const college = await College.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });
    
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    await college.deleteOne();
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate custom routes
function generateCustomRoutes(college) {
  const routes = {
    main: [
      { path: '/', component: 'Home' },
      { path: '/departments', component: 'Departments' },
      { path: '/facilities', component: 'Facilities' },
      { path: '/news-events', component: 'NewsEvents' },
      { path: '/faculty', component: 'Faculty' },
      { path: '/courses', component: 'Courses' },
      { path: '/research', component: 'Research' },
      { path: '/virtual-tour', component: 'VirtualTour' },
      { path: '/admissions', component: 'Admissions' }
    ],
    custom: []
  };

  // Add custom routes based on college features
  if (college.features?.studentPortal) {
    routes.custom.push({ path: '/student-portal', component: 'StudentPortal' });
  }
  if (college.features?.facultyPortal) {
    routes.custom.push({ path: '/faculty-portal', component: 'FacultyPortal' });
  }
  if (college.features?.libraryManagement) {
    routes.custom.push({ path: '/library', component: 'Library' });
  }
  if (college.features?.eventsCalendar) {
    routes.custom.push({ path: '/calendar', component: 'Calendar' });
  }

  // Add department-specific routes
  college.departments?.forEach(dept => {
    const deptSlug = dept.name.toLowerCase().replace(/\s+/g, '-');
    routes.custom.push({ path: `/departments/${deptSlug}`, component: 'DepartmentDetail' });
  });

  return routes;
}

// Helper function to generate website HTML
function generateWebsiteTemplate(college) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${college.name}</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
      <!-- Header -->
      <header class="bg-blue-600 text-white p-6">
        <div class="container mx-auto">
          <h1 class="text-4xl font-bold">${college.name}</h1>
          <p class="mt-2">${college.description}</p>
        </div>
      </header>

      <!-- Contact Information -->
      <section class="py-8 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Email:</strong> ${college.contact.email}</p>
              <p><strong>Phone:</strong> ${college.contact.phone}</p>
            </div>
            <div>
              <p><strong>Address:</strong></p>
              <p>${college.address.street}</p>
              <p>${college.address.city}, ${college.address.state} ${college.address.zipCode}</p>
              <p>${college.address.country}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Departments -->
      <section class="py-8 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">Departments</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${college.departments.map(dept => `
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-xl font-semibold mb-2">${dept.name}</h3>
                <p class="text-gray-600">${dept.description}</p>
                <p class="mt-2"><strong>Department Head:</strong> ${dept.head}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Facilities -->
      <section class="py-8 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">Facilities</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${college.facilities.map(facility => `
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2">${facility.name}</h3>
                <p class="text-gray-600">${facility.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Events -->
      <section class="py-8 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">Upcoming Events</h2>
          <div class="space-y-4">
            ${college.events.map(event => `
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-xl font-semibold mb-2">${event.title}</h3>
                <p class="text-gray-600">${event.description}</p>
                <p class="mt-2 text-blue-600">${new Date(event.date).toLocaleDateString()}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- News -->
      <section class="py-8 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">Latest News</h2>
          <div class="space-y-4">
            ${college.news.map(item => `
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-2">${item.title}</h3>
                <p class="text-gray-600">${item.content}</p>
                <p class="mt-2 text-blue-600">${new Date(item.date).toLocaleDateString()}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Gallery -->
      <section class="py-8 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">Photo Gallery</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${college.gallery.map(image => `
              <div class="bg-white p-4 rounded-lg shadow">
                <img src="${image.imageUrl}" alt="${image.caption}" class="w-full h-48 object-cover rounded">
                <p class="mt-2 text-center">${image.caption}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-800 text-white py-8">
        <div class="container mx-auto px-4 text-center">
          <p>&copy; ${new Date().getFullYear()} ${college.name}. All rights reserved.</p>
        </div>
      </footer>
    </body>
    </html>
  `;
}

module.exports = router; 