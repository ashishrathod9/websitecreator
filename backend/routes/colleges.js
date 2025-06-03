const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Website = require('../models/Website');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

// Middleware to handle CORS
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://websitecreator-navy.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Download website code - This needs to be before the /:id route
router.get('/download/:id', async (req, res) => {
    try {
        const website = await Website.findById(req.params.id);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        // Create a temporary directory for the files
        const tempDir = path.join(__dirname, '../temp', website._id.toString());
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate HTML file
        const htmlContent = generateHTML(website);
        fs.writeFileSync(path.join(tempDir, 'index.html'), htmlContent);

        // Generate CSS file
        const cssContent = generateCSS(website);
        fs.writeFileSync(path.join(tempDir, 'styles.css'), cssContent);

        // Generate JavaScript file
        const jsContent = generateJavaScript(website);
        fs.writeFileSync(path.join(tempDir, 'script.js'), jsContent);

        // Create a ZIP file
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        // Set the response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${website.collegeName.toLowerCase().replace(/\s+/g, '-')}-website.zip`);

        // Pipe the archive to the response
        archive.pipe(res);

        // Add the files to the archive
        archive.directory(tempDir, false);

        // Finalize the archive
        await archive.finalize();

        // Clean up the temporary directory
        fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.error('Error generating download:', error);
        res.status(500).json({ message: error.message });
    }
});

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

// Helper functions to generate the website files
function generateHTML(website) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.collegeName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${website.collegeName}</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#programs">Programs</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <h1>Welcome to ${website.collegeName}</h1>
            <p>${website.description || 'Empowering minds, shaping futures'}</p>
        </section>

        <section id="about" class="about">
            <h2>About Us</h2>
            <p>${website.description || 'We are committed to providing quality education and fostering academic excellence.'}</p>
        </section>

        <section id="programs" class="programs">
            <h2>Our Programs</h2>
            <div class="program-grid">
                ${website.features ? Object.entries(website.features)
                    .filter(([_, enabled]) => enabled)
                    .map(([feature]) => `<div class="program-card">
                        <h3>${feature.replace(/([A-Z])/g, ' $1').trim()}</h3>
                        <p>Learn more about our ${feature.toLowerCase()} program.</p>
                    </div>`).join('') : ''}
            </div>
        </section>

        <section id="contact" class="contact">
            <h2>Contact Us</h2>
            <div class="contact-info">
                <p>Email: ${website.contact?.email || 'contact@college.edu'}</p>
                <p>Phone: ${website.contact?.phone || '(123) 456-7890'}</p>
                <p>Address: ${website.location?.street || '123 College Street'}, ${website.location?.city || 'City'}, ${website.location?.state || 'State'} ${website.location?.zipCode || '12345'}</p>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; ${new Date().getFullYear()} ${website.collegeName}. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
}

function generateCSS(website) {
    return `/* Global Styles */
:root {
    --primary-color: ${website.colorScheme || '#1a365d'};
    --secondary-color: #f8f9fa;
    --text-color: #333;
    --accent-color: #007bff;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
}

/* Header Styles */
header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem 0;
}

nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav ul {
    display: flex;
    list-style: none;
}

nav ul li {
    margin-left: 2rem;
}

nav ul li a {
    color: white;
    text-decoration: none;
    transition: color 0.3s ease;
}

nav ul li a:hover {
    color: var(--accent-color);
}

/* Hero Section */
.hero {
    background-color: var(--secondary-color);
    padding: 4rem 2rem;
    text-align: center;
}

.hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

/* About Section */
.about {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.about h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

/* Programs Section */
.programs {
    background-color: var(--secondary-color);
    padding: 4rem 2rem;
}

.programs h2 {
    text-align: center;
    color: var(--primary-color);
    margin-bottom: 2rem;
}

.program-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.program-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.program-card:hover {
    transform: translateY(-5px);
}

.program-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

/* Contact Section */
.contact {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.contact h2 {
    color: var(--primary-color);
    margin-bottom: 2rem;
}

.contact-info {
    background: var(--secondary-color);
    padding: 2rem;
    border-radius: 8px;
}

/* Footer */
footer {
    background-color: var(--primary-color);
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    nav {
        flex-direction: column;
        text-align: center;
    }

    nav ul {
        margin-top: 1rem;
    }

    nav ul li {
        margin: 0 1rem;
    }

    .hero h1 {
        font-size: 2rem;
    }
}`;
}

function generateJavaScript(website) {
    return `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation to program cards
const programCards = document.querySelectorAll('.program-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

programCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Mobile menu toggle
const createMobileMenu = () => {
    const nav = document.querySelector('nav ul');
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-button';
    menuButton.innerHTML = '☰';
    
    document.querySelector('nav').insertBefore(menuButton, nav);
    
    menuButton.addEventListener('click', () => {
        nav.classList.toggle('show');
    });
};

// Initialize mobile menu if screen width is small
if (window.innerWidth <= 768) {
    createMobileMenu();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-button')) {
        createMobileMenu();
    }
});`;
}

module.exports = router; 